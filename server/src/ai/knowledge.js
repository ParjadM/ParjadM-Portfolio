import crypto from 'crypto'
import { AiKnowledge } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { aiConfig } from '../config/ai.js'
import { normalizeText } from './normalize.js'

const memoryCache = new Map()

function hashContent(content) {
  return crypto.createHash('sha256').update(content || '').digest('hex').slice(0, 12)
}

function splitChunks(content) {
  return content
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
}

function scoreChunk(chunk, query) {
  const queryWords = new Set(
    normalizeText(query)
      .split(' ')
      .filter((word) => word.length > 2)
  )
  if (queryWords.size === 0) return 0

  const chunkWords = normalizeText(chunk).split(' ')
  let score = 0
  for (const word of chunkWords) {
    if (queryWords.has(word)) score++
  }
  return score
}

function selectChunks(content, userMessage, maxChars) {
  if (!content) return ''
  if (content.length <= maxChars) return content

  const chunks = splitChunks(content)
  if (chunks.length === 0) return content.slice(0, maxChars)

  const ranked = chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, userMessage) }))
    .sort((a, b) => b.score - a.score)

  let result = ''
  for (const { chunk } of ranked) {
    const next = result ? `${result}\n\n${chunk}` : chunk
    if (next.length > maxChars) {
      if (!result) return chunk.slice(0, maxChars)
      break
    }
    result = next
  }

  return result || chunks[0].slice(0, maxChars)
}

async function fetchKnowledgeDoc(key) {
  const cached = memoryCache.get(key)
  if (cached && Date.now() - cached.fetchedAt < aiConfig.knowledgeCacheMs) {
    return cached
  }

  if (currentEngine !== 'mongo') {
    const empty = { content: '', version: '0', fetchedAt: Date.now() }
    memoryCache.set(key, empty)
    return empty
  }

  const doc = await AiKnowledge.findOne({ key }).lean()
  const content = doc?.content || ''
  const entry = {
    content,
    version: hashContent(content),
    fetchedAt: Date.now(),
  }
  memoryCache.set(key, entry)
  return entry
}

export async function getKnowledgeContext(knowledgeKey, userMessage) {
  const doc = await fetchKnowledgeDoc(knowledgeKey || 'global')
  const text = selectChunks(doc.content, userMessage, aiConfig.knowledgeMaxChars)
  return {
    version: doc.version,
    text,
  }
}

export function clearKnowledgeMemoryCache() {
  memoryCache.clear()
}
