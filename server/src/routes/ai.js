import { Router } from 'express'
import { askGemini, streamGeminiChat } from '../ai/askGemini.js'
import { aiConfig } from '../config/ai.js'
import { extractLastUserMessage, formatInterviewTranscript, countUserTurns } from '../ai/normalize.js'
import { matchFaq } from '../ai/faq.js'
import { getStaticPageSummary, matchStaticAnswer } from '../ai/staticAnswers.js'
import { getClientIp } from '../ai/limits.js'
import { explainBlogPost } from '../ai/blogExplain.js'
import { getUsageSnapshot } from '../ai/limits.js'
import { normalizeLocale } from '../ai/locale.js'

const router = Router()

const CHAT_PROMPT = `You are a helpful AI assistant for Parjad's portfolio website.
You answer questions about Parjad based on the following information:`

const INTERVIEW_PROMPT = `You are Parjad Minooei, a talented Software Engineer. You are currently in a technical job interview with a recruiter or hiring manager.
Answer their questions confidently, accurately, and professionally, but let your personality shine through. Use the following facts about your background:`

const COMPLEXITY_PROMPT = `You are an expert static analyzer for code complexity.
Analyze the following source code and determine its Time Complexity and Space (Memory) Complexity.
Provide the complexity BOTH with constants (exact operations/space count, e.g., O(3N + 2)) and without constants (Big-O notation, e.g., O(N)).
Respond EXCLUSIVELY in valid JSON format using the following schema:
{
  "timeWithConstant": "...",
  "timeWithoutConstant": "...",
  "memoryWithConstant": "...",
  "memoryWithoutConstant": "...",
  "explanation": "A concise explanation."
}`

const JOB_FIT_PROMPT = `You are a hiring analyst comparing a job description to Parjad Minooei's background.
Use the candidate knowledge below. Be honest, constructive, and recruiter-friendly.
Respond EXCLUSIVELY in valid JSON:
{
  "matchScore": 0-100,
  "matchingSkills": ["..."],
  "gaps": ["..."],
  "relevantProjects": ["..."],
  "talkingPoints": ["..."],
  "summary": "2-3 sentence overview"
}`

const DEBRIEF_PROMPT = `You are an interview coach reviewing a mock interview transcript where AI played Parjad.
Provide constructive feedback for the interviewer/candidate. Be specific and balanced.
Respond EXCLUSIVELY in valid JSON:
{
  "strengths": ["..."],
  "areasToImprove": ["..."],
  "standoutAnswers": ["..."],
  "weakAnswers": ["..."],
  "followUpQuestions": ["..."],
  "overallSummary": "2-4 sentences"
}`

const CODE_REVIEW_PROMPT = `You are a senior code reviewer. Analyze the submitted code for bugs, readability, and complexity.
Respond EXCLUSIVELY in valid JSON:
{
  "bugs": ["..."],
  "readabilityScore": 1-10,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "suggestions": ["..."],
  "summary": "2-3 sentence overview"
}`

router.post('/chat', async (req, res) => {
  try {
    const { messages, context, pageContext, locale: reqLocale } = req.body
    const locale = normalizeLocale(reqLocale)

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    const userMessage = extractLastUserMessage(messages)
    const result = await askGemini({
      feature: 'chat',
      userMessage,
      messages,
      context,
      pageContext,
      systemPromptBase: CHAT_PROMPT,
      knowledgeKey: 'global',
      knowledgeFallback: 'No specific knowledge provided yet. Please direct them to the contact page.',
      req,
      locale,
      cacheTtl: aiConfig.cacheTtlChat,
    })

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error })
    }

    res.json({ reply: result.reply, source: result.source })
  } catch (err) {
    console.error('AI Chat Error:', err)
    res.status(500).json({ error: err.message || 'Failed to generate AI response' })
  }
})

router.post('/chat/stream', async (req, res) => {
  try {
    const { messages, context, pageContext, locale: reqLocale } = req.body
    const locale = normalizeLocale(reqLocale)

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    if (!aiConfig.streamingEnabled) {
      const userMessage = extractLastUserMessage(messages)
      const result = await askGemini({
        feature: 'chat',
        userMessage,
        messages,
        context,
        pageContext,
        systemPromptBase: CHAT_PROMPT,
        knowledgeKey: 'global',
        knowledgeFallback: 'No specific knowledge provided yet. Please direct them to the contact page.',
        req,
        locale,
        cacheTtl: aiConfig.cacheTtlChat,
      })
      if (!result.ok) {
        return res.status(result.status || 500).json({ error: result.error })
      }
      return res.json({ reply: result.reply, source: result.source })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const userMessage = extractLastUserMessage(messages)
    await streamGeminiChat({
      feature: 'chat',
      userMessage,
      messages,
      context,
      pageContext,
      systemPromptBase: CHAT_PROMPT,
      knowledgeKey: 'global',
      knowledgeFallback: 'No specific knowledge provided yet. Please direct them to the contact page.',
      req,
      locale,
      cacheTtl: aiConfig.cacheTtlChat,
    }, res)
  } catch (err) {
    console.error('AI Chat Stream Error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Failed to stream AI response' })
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    }
  }
})

router.post('/interview', async (req, res) => {
  try {
    const { messages, isRecruiter, locale: reqLocale } = req.body
    const locale = normalizeLocale(reqLocale)

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    const userMessage = extractLastUserMessage(messages)
    const result = await askGemini({
      feature: 'interview',
      userMessage,
      messages,
      systemPromptBase: `${INTERVIEW_PROMPT}
Do not break character. Do not admit you are an AI assistant. You ARE Parjad. If the interview concludes, thank them for their time.`,
      knowledgeKey: 'interview',
      knowledgeFallback: 'You are a Software Engineer with experience in React, Node.js, Python, and MongoDB.',
      req,
      locale,
      skipFaq: true,
      skipStatic: true,
      cacheTtl: aiConfig.cacheTtlInterview,
      customDailyLimit: isRecruiter
        ? aiConfig.interviewRecruiterDailyPerIp
        : aiConfig.interviewDailyPerIp,
    })

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error })
    }

    res.json({ reply: result.reply, source: result.source })
  } catch (err) {
    console.error('AI Interview Error:', err)
    res.status(500).json({ error: err.message || 'Failed to generate AI response' })
  }
})

router.post('/interview/debrief', async (req, res) => {
  try {
    const { messages, locale: reqLocale } = req.body
    const locale = normalizeLocale(reqLocale)
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    const userTurns = countUserTurns(messages)
    if (userTurns < aiConfig.debriefMinTurns) {
      return res.status(400).json({
        error: `Ask at least ${aiConfig.debriefMinTurns} interview questions before requesting a debrief.`,
      })
    }

    const transcript = formatInterviewTranscript(messages)
    const result = await askGemini({
      feature: 'debrief',
      userMessage: transcript,
      messages: [{ role: 'user', parts: [{ text: transcript }] }],
      systemPromptBase: DEBRIEF_PROMPT,
      knowledgeKey: 'interview',
      knowledgeFallback: 'Parjad is a full-stack engineer with React, Node.js, Python, and MongoDB experience.',
      responseFormat: 'json',
      req,
      locale,
      skipFaq: true,
      skipStatic: true,
      cacheTtl: aiConfig.cacheTtlDebrief,
      maxOutputTokensOverride: aiConfig.maxOutputTokensDetailed,
    })

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error })
    }

    res.json({ ...result.reply, source: result.source })
  } catch (err) {
    console.error('AI Debrief Error:', err)
    res.status(500).json({ error: err.message || 'Failed to generate debrief' })
  }
})

router.post('/job-fit', async (req, res) => {
  try {
    const { jobDescription, locale: reqLocale } = req.body
    const locale = normalizeLocale(reqLocale)
    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ error: 'jobDescription string is required' })
    }

    const trimmed = jobDescription.trim()
    if (trimmed.length < 40) {
      return res.status(400).json({ error: 'Please paste a fuller job description (at least 40 characters).' })
    }

    const capped = trimmed.slice(0, aiConfig.jobDescriptionMaxChars)
    const result = await askGemini({
      feature: 'job-fit',
      userMessage: capped,
      messages: [{ role: 'user', parts: [{ text: capped }] }],
      systemPromptBase: JOB_FIT_PROMPT,
      knowledgeKey: 'global',
      knowledgeFallback: 'Parjad is a Software Engineer skilled in React, Node.js, Express, MongoDB, and Python.',
      responseFormat: 'json',
      req,
      locale,
      skipFaq: true,
      skipStatic: true,
      cacheTtl: aiConfig.cacheTtlJobFit,
      maxOutputTokensOverride: aiConfig.maxOutputTokensDetailed,
    })

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error })
    }

    res.json({ ...result.reply, source: result.source })
  } catch (err) {
    console.error('AI Job Fit Error:', err)
    res.status(500).json({ error: err.message || 'Failed to analyze job fit' })
  }
})

router.post('/review', async (req, res) => {
  try {
    const { code, language, locale: reqLocale } = req.body
    const locale = normalizeLocale(reqLocale)
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code string is required' })
    }

    const trimmed = code.trim()
    if (trimmed.length < 10) {
      return res.status(400).json({ error: 'Please provide more code to review.' })
    }

    const capped = trimmed.slice(0, aiConfig.codeReviewMaxChars)
    const label = language ? `Language: ${language}\n\n` : ''
    const payload = `${label}${capped}`

    const result = await askGemini({
      feature: 'code-review',
      userMessage: capped,
      messages: [{ role: 'user', parts: [{ text: payload }] }],
      systemPromptBase: CODE_REVIEW_PROMPT,
      responseFormat: 'json',
      req,
      locale,
      skipFaq: true,
      skipStatic: true,
      skipKnowledge: true,
      cacheTtl: aiConfig.cacheTtlCodeReview,
      maxOutputTokensOverride: aiConfig.maxOutputTokensDetailed,
    })

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error })
    }

    res.json({ ...result.reply, source: result.source })
  } catch (err) {
    console.error('AI Review Error:', err)
    res.status(500).json({ error: err.message || 'Failed to review code' })
  }
})

router.post('/blog/explain', async (req, res) => {
  try {
    const { postId, mode } = req.body
    const result = await explainBlogPost({ postId, mode, req })

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error })
    }

    res.json({ reply: result.reply, mode: result.mode, source: result.source })
  } catch (err) {
    console.error('AI Blog Explain Error:', err)
    res.status(500).json({ error: err.message || 'Failed to explain blog post' })
  }
})

router.post('/complexity', async (req, res) => {
  try {
    const { code } = req.body

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code string is required' })
    }

    const result = await askGemini({
      feature: 'complexity',
      userMessage: code.trim(),
      systemPromptBase: COMPLEXITY_PROMPT,
      responseFormat: 'json',
      req,
      skipFaq: true,
      skipStatic: true,
      skipKnowledge: true,
      cacheTtl: aiConfig.cacheTtlComplexity,
    })

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error })
    }

    res.json(result.reply)
  } catch (err) {
    console.error('AI Complexity Error:', err)
    res.status(500).json({ error: err.message || 'Failed to analyze code complexity' })
  }
})

router.get('/static', (req, res) => {
  const { q, path } = req.query
  const query = typeof q === 'string' ? q : ''
  const pathname = typeof path === 'string' ? path : ''

  const pageContext = pathname ? { pathname, type: 'page' } : null
  const answer = matchStaticAnswer(query, pageContext) || matchFaq(query) || getStaticPageSummary(pathname)

  res.json({ answer: answer || null })
})

router.get('/usage', async (req, res) => {
  const snapshot = await getUsageSnapshot(getClientIp(req))
  res.json(snapshot)
})

export default router
