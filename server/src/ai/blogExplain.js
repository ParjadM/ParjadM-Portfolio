import crypto from 'crypto'
import mongoose from 'mongoose'
import { BlogPost } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { askGemini } from './askGemini.js'
import { aiConfig } from '../config/ai.js'
import { recordAiEvent } from './analytics.js'

const TLDR_PROMPT = `You write concise blog TL;DR summaries in 2-3 sentences.
Be accurate, friendly, and avoid fluff.`

const JUNIOR_PROMPT = `You explain technical blog content in plain language for a junior developer.
Use short paragraphs, define jargon, and keep it under 150 words.`

function contentVersion(content) {
  return crypto.createHash('sha256').update(content || '').digest('hex').slice(0, 12)
}

export async function explainBlogPost({ postId, mode, req }, { generate = askGemini } = {}) {
  if (!postId || !['tldr', 'junior'].includes(mode)) {
    return { ok: false, status: 400, error: 'postId and mode (tldr|junior) are required' }
  }

  if (currentEngine !== 'mongo') return { ok: false, status: 503, error: 'Article database temporarily unavailable' }
  if (!mongoose.isValidObjectId(postId)) {
    return { ok: false, status: 404, error: 'Post not found' }
  }

  const now = new Date()
  const doc = await BlogPost.findOne({
    _id: postId,
    status: 'published',
    publishAt: { $lte: now },
  }).lean()

  if (!doc) {
    return { ok: false, status: 404, error: 'Post not found' }
  }

  const version = contentVersion(doc.content)
  const cached = mode === 'tldr' ? doc.aiTldr : doc.aiJuniorExplain
  if (cached && doc.aiExplainVersion === version) {
    recordAiEvent({
      feature: 'blog-explain',
      source: 'stored',
      userMessage: `${mode}:${postId}`,
      pathname: `/blog/${postId}`,
    })
    return { ok: true, source: 'stored', reply: cached, mode }
  }

  const excerpt = String(doc.content || '').replace(/\s+/g, ' ').trim().slice(0, 2500)
  const userMessage = `${mode}:${postId}:${version}`
  const systemPromptBase = mode === 'tldr' ? TLDR_PROMPT : JUNIOR_PROMPT
  const promptBody = `Title: ${doc.title}\nCategory: ${doc.category || 'general'}\n\nContent:\n${excerpt}`

  const result = await generate({
    feature: 'blog-explain',
    userMessage,
    messages: [{ role: 'user', parts: [{ text: promptBody }] }],
    systemPromptBase,
    knowledgeKey: 'global',
    skipFaq: true,
    skipStatic: true,
    skipKnowledge: true,
    responseFormat: 'text',
    req,
    cacheTtl: aiConfig.cacheTtlChat,
    maxOutputTokensOverride: aiConfig.maxOutputTokensDetailed,
  })

  if (!result.ok) {
    return result
  }

  if (typeof result.reply !== 'string' || !result.reply.trim()) {
    return { ok: false, status: 502, error: 'The AI returned an empty summary. Please retry.' }
  }

  const update = mode === 'tldr'
    ? { aiTldr: result.reply, aiExplainVersion: version }
    : { aiJuniorExplain: result.reply, aiExplainVersion: version }

  // Persistence is an optimization, not a prerequisite for delivering generated text.
  // Avoid attaching an old summary if the article changed during generation.
  try {
    await BlogPost.updateOne({ _id: postId, content: doc.content }, { $set: update })
  } catch {
    console.warn('Blog summary generated but could not be saved')
  }

  return { ok: true, source: result.source, reply: result.reply, mode }
}
