import { GoogleGenAI } from '@google/genai'
import { aiConfig } from '../config/ai.js'
import { matchFaq } from './faq.js'
import { buildCacheKey, getCached, setCached } from './cache.js'
import { getKnowledgeContext } from './knowledge.js'
import { buildContextSlug, resolveChatContext } from './pageContext.js'
import { matchStaticAnswer } from './staticAnswers.js'
import { recordAiEvent } from './analytics.js'
import {
  assertCanCallGemini,
  getClientIp,
  recordGeminiCall,
} from './limits.js'
import { extractLastUserMessage, trimMessages } from './normalize.js'

function parseGeminiError(err) {
  const message = err?.message || 'Failed to generate AI response'
  if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
    return "I've been answering a lot of questions lately and need a quick breather! Please wait about a minute and ask me again."
  }
  return message
}

function buildSystemInstruction({ systemPromptBase, knowledgeText, context, fallbackText, skipKnowledge, locale }) {
  const languageSuffix = locale?.startsWith('fr')
    ? '\n\nIMPORTANT: Write all user-facing text in French (Canadian French preferred). Keep code snippets, URLs, and proper nouns unchanged.'
    : '';

  if (skipKnowledge) {
    const base = context ? `${systemPromptBase}\n\nAdditional Context: ${context}` : systemPromptBase;
    return `${base}${languageSuffix}`;
  }

  const knowledgeSection = knowledgeText
    ? knowledgeText
    : fallbackText || 'No specific knowledge provided yet. Please direct them to the contact page.';

  let instruction = `${systemPromptBase}\n${knowledgeSection}`;
  if (context) {
    instruction += `\n\nAdditional Context: ${context}`;
  }
  return `${instruction}${languageSuffix}`;
}

function buildContents(messages, userMessage) {
  if (Array.isArray(messages) && messages.length > 0) {
    return trimMessages(messages, aiConfig.maxHistoryTurns)
  }
  return [{ role: 'user', parts: [{ text: userMessage }] }]
}

function pathnameFromContext(pageContext) {
  return pageContext?.pathname || ''
}

function trackSuccess({ feature, source, userMessage, pageContext }) {
  recordAiEvent({
    feature,
    source,
    userMessage,
    pathname: pathnameFromContext(pageContext),
  })
}

export async function resolveAiPipeline({
  feature,
  userMessage,
  messages,
  context,
  pageContext,
  systemPromptBase,
  knowledgeKey = 'global',
  knowledgeFallback,
  responseFormat = 'text',
  req,
  skipFaq = false,
  skipStatic = false,
  skipCache = false,
  skipKnowledge = false,
  cacheTtl,
  customDailyLimit,
  locale,
}) {
  const resolvedMessage = userMessage || extractLastUserMessage(messages)
  if (!resolvedMessage?.trim()) {
    return { ok: false, status: 400, error: 'A user message is required' }
  }

  if (!skipFaq && responseFormat === 'text') {
    const faqAnswer = matchFaq(resolvedMessage)
    if (faqAnswer) {
      return { ok: true, instant: true, source: 'faq', reply: faqAnswer, resolvedMessage }
    }
  }

  if (!skipStatic && responseFormat === 'text') {
    const staticAnswer = matchStaticAnswer(resolvedMessage, pageContext)
    if (staticAnswer) {
      return { ok: true, instant: true, source: 'static', reply: staticAnswer, resolvedMessage }
    }
  }

  const resolvedContext = resolveChatContext({ context, pageContext })
  const knowledge = skipKnowledge
    ? { version: '0', text: '' }
    : await getKnowledgeContext(knowledgeKey || 'global', resolvedMessage)
  const contextSlug = buildContextSlug(pageContext, context)
  const cacheKey = buildCacheKey(feature, resolvedMessage, contextSlug, knowledge.version)

  if (!skipCache) {
    const cached = await getCached(cacheKey, responseFormat === 'json')
    if (cached != null) {
      return {
        ok: true,
        instant: true,
        source: 'cache',
        reply: cached,
        resolvedMessage,
      }
    }
  }

  const ip = getClientIp(req)
  const limitState = await assertCanCallGemini({ feature, ip, customDailyLimit })
  if (!limitState.ok) {
    return limitState
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, status: 500, error: 'GEMINI_API_KEY is not configured' }
  }

  return {
    ok: true,
    instant: false,
    gemini: {
      apiKey,
      systemInstruction: buildSystemInstruction({
        systemPromptBase,
        knowledgeText: knowledge.text,
        context: resolvedContext,
        fallbackText: knowledgeFallback,
        skipKnowledge,
        locale,
      }),
      contents: buildContents(messages, resolvedMessage),
      cacheKey,
      cacheTtl,
      asJson: responseFormat === 'json',
      limitState,
      resolvedMessage,
    },
  }
}

export async function askGemini(options) {
  const {
    feature,
    pageContext,
    responseFormat = 'text',
    maxOutputTokensOverride,
    skipCache,
    cacheTtl,
  } = options

  const pipeline = await resolveAiPipeline(options)
  if (!pipeline.ok) {
    return pipeline
  }

  if (pipeline.instant) {
    trackSuccess({
      feature,
      source: pipeline.source,
      userMessage: pipeline.resolvedMessage,
      pageContext,
    })
    return { ok: true, source: pipeline.source, reply: pipeline.reply }
  }

  const { gemini } = pipeline
  const ai = new GoogleGenAI({ apiKey: gemini.apiKey })

  try {
    const response = await ai.models.generateContent({
      model: aiConfig.model,
      contents: gemini.contents,
      config: {
        systemInstruction: gemini.systemInstruction,
        maxOutputTokens: maxOutputTokensOverride || aiConfig.maxOutputTokens,
        ...(gemini.asJson ? { responseMimeType: 'application/json' } : {}),
      },
    })

    let reply = response.text
    if (gemini.asJson) {
      try {
        reply = JSON.parse(response.text)
      } catch {
        reply = {
          timeWithoutConstant: 'O(?)',
          memoryWithoutConstant: 'O(?)',
          explanation: 'Could not parse AI response.',
        }
      }
    }

    await recordGeminiCall({
      featureStorageKey: gemini.limitState.featureStorageKey,
      globalStorageKey: gemini.limitState.globalStorageKey,
    })

    if (!skipCache && cacheTtl) {
      await setCached(gemini.cacheKey, reply, cacheTtl, gemini.asJson)
    }

    trackSuccess({
      feature,
      source: 'gemini',
      userMessage: gemini.resolvedMessage,
      pageContext,
    })

    return { ok: true, source: 'gemini', reply }
  } catch (err) {
    console.error(`AI ${feature} error:`, err)
    return { ok: false, status: 500, error: parseGeminiError(err) }
  }
}

export async function streamGeminiChat(options, res) {
  const { feature, pageContext, maxOutputTokensOverride, skipCache, cacheTtl } = options

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const pipeline = await resolveAiPipeline(options)
  if (!pipeline.ok) {
    sendEvent('error', { error: pipeline.error, status: pipeline.status || 500 })
    return res.end()
  }

  if (pipeline.instant) {
    trackSuccess({
      feature,
      source: pipeline.source,
      userMessage: pipeline.resolvedMessage,
      pageContext,
    })
    sendEvent('meta', { source: pipeline.source })
    sendEvent('token', { text: typeof pipeline.reply === 'string' ? pipeline.reply : JSON.stringify(pipeline.reply) })
    sendEvent('done', {})
    return res.end()
  }

  const { gemini } = pipeline
  const ai = new GoogleGenAI({ apiKey: gemini.apiKey })
  let fullText = ''

  try {
    sendEvent('meta', { source: 'gemini' })

    const stream = await ai.models.generateContentStream({
      model: aiConfig.model,
      contents: gemini.contents,
      config: {
        systemInstruction: gemini.systemInstruction,
        maxOutputTokens: maxOutputTokensOverride || aiConfig.maxOutputTokens,
      },
    })

    for await (const chunk of stream) {
      const text = chunk.text
      if (text) {
        fullText += text
        sendEvent('token', { text })
      }
    }

    await recordGeminiCall({
      featureStorageKey: gemini.limitState.featureStorageKey,
      globalStorageKey: gemini.limitState.globalStorageKey,
    })

    if (fullText && !skipCache && cacheTtl) {
      await setCached(gemini.cacheKey, fullText, cacheTtl, false)
    }

    trackSuccess({
      feature,
      source: 'gemini',
      userMessage: gemini.resolvedMessage,
      pageContext,
    })

    sendEvent('done', {})
    res.end()
  } catch (err) {
    console.error(`AI ${feature} stream error:`, err)
    sendEvent('error', { error: parseGeminiError(err) })
    res.end()
  }
}

export { parseGeminiError }
