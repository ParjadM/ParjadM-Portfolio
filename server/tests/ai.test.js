import test from 'node:test'
import assert from 'node:assert/strict'
import { matchFaq } from '../src/ai/faq.js'
import { buildCacheKey } from '../src/ai/cache.js'
import { normalizeText, extractLastUserMessage, trimMessages, formatInterviewTranscript, countUserTurns } from '../src/ai/normalize.js'
import { resolveChatContext, buildContextSlug } from '../src/ai/pageContext.js'
import { matchStaticAnswer, getStaticPageSummary } from '../src/ai/staticAnswers.js'
import { buildTopicSlug, getAdminAiStats } from '../src/ai/analytics.js'

test('normalizeText lowercases and strips punctuation', () => {
  assert.equal(normalizeText('Who is Parjad?!'), 'who is parjad')
})

test('matchFaq returns static answer for common questions', () => {
  const answer = matchFaq('How can I contact Parjad?')
  assert.ok(answer)
  assert.match(answer, /contact/i)
})

test('matchFaq returns null for unknown questions', () => {
  assert.equal(matchFaq('xyzzy plugh'), null)
})

test('buildCacheKey is stable for equivalent normalized input', () => {
  const keyA = buildCacheKey('chat', 'Who is Parjad?', 'about', 'v1')
  const keyB = buildCacheKey('chat', 'who is parjad??', 'about', 'v1')
  assert.equal(keyA, keyB)
})

test('buildCacheKey changes when knowledge version changes', () => {
  const keyA = buildCacheKey('chat', 'skills', '', 'v1')
  const keyB = buildCacheKey('chat', 'skills', '', 'v2')
  assert.notEqual(keyA, keyB)
})

test('extractLastUserMessage reads Gemini-style payloads', () => {
  const messages = [
    { role: 'user', parts: [{ text: 'first' }] },
    { role: 'model', parts: [{ text: 'reply' }] },
    { role: 'user', parts: [{ text: 'second' }] },
  ]
  assert.equal(extractLastUserMessage(messages), 'second')
})

test('trimMessages keeps only the most recent turns', () => {
  const messages = Array.from({ length: 10 }, (_, index) => ({
    role: index % 2 === 0 ? 'user' : 'model',
    parts: [{ text: `m${index}` }],
  }))
  assert.equal(trimMessages(messages, 2).length, 4)
})

test('resolveChatContext includes project metadata', () => {
  const context = resolveChatContext({
    pageContext: {
      type: 'project',
      pathname: '/projects',
      title: 'CodeQuest',
      description: 'A learning game',
      tags: ['React'],
    },
  })
  assert.match(context, /CodeQuest/)
  assert.match(context, /React/)
})

test('matchStaticAnswer returns project blurb for generic project questions', () => {
  const answer = matchStaticAnswer('tell me about this project', {
    type: 'project',
    title: 'LQFT Benchmark',
    description: 'Benchmark demo',
    tags: ['Python'],
  })
  assert.ok(answer)
  assert.match(answer, /LQFT/i)
})

test('getStaticPageSummary returns route help text', () => {
  const summary = getStaticPageSummary('/stats')
  assert.ok(summary)
  assert.match(summary, /Stats/i)
})

test('buildContextSlug differs between pages', () => {
  const a = buildContextSlug({ type: 'project', pathname: '/projects', title: 'A' })
  const b = buildContextSlug({ type: 'project', pathname: '/projects', title: 'B' })
  assert.notEqual(a, b)
})

test('formatInterviewTranscript formats roles', () => {
  const transcript = formatInterviewTranscript([
    { role: 'user', parts: [{ text: 'Tell me about React.' }] },
    { role: 'model', parts: [{ text: 'I have built several React apps.' }] },
  ])
  assert.match(transcript, /Interviewer/)
  assert.match(transcript, /Parjad/)
})

test('countUserTurns counts interviewer messages', () => {
  const count = countUserTurns([
    { role: 'model', parts: [{ text: 'Hi' }] },
    { role: 'user', parts: [{ text: 'Q1' }] },
    { role: 'model', parts: [{ text: 'A1' }] },
    { role: 'user', parts: [{ text: 'Q2' }] },
  ])
  assert.equal(count, 2)
})

test('buildTopicSlug normalizes questions for analytics', () => {
  const slug = buildTopicSlug('Who is Parjad?!')
  assert.equal(slug, 'who is parjad')
})

test('getAdminAiStats returns shape without mongo', async () => {
  const stats = await getAdminAiStats(7)
  assert.ok(stats.global)
  assert.ok(stats.today)
  assert.ok(Array.isArray(stats.series))
  assert.ok(Array.isArray(stats.topTopics))
})
