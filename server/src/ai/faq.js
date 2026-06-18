import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { normalizeText } from './normalize.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const faqPath = join(__dirname, '../../data/faq.json')

let faqEntries = null

function loadFaq() {
  if (faqEntries) return faqEntries
  try {
    faqEntries = JSON.parse(readFileSync(faqPath, 'utf8'))
  } catch {
    faqEntries = []
  }
  return faqEntries
}

function matchesPattern(normalizedQuestion, pattern) {
  const normalizedPattern = normalizeText(pattern)
  if (!normalizedPattern) return false
  if (normalizedQuestion === normalizedPattern) return true
  if (normalizedQuestion.includes(normalizedPattern)) return true

  const patternWords = normalizedPattern.split(' ').filter((word) => word.length > 2)
  if (patternWords.length === 0) return false
  return patternWords.every((word) => normalizedQuestion.includes(word))
}

export function matchFaq(question) {
  const normalizedQuestion = normalizeText(question)
  if (!normalizedQuestion || normalizedQuestion.length < 3) return null

  for (const entry of loadFaq()) {
    for (const pattern of entry.patterns || []) {
      if (matchesPattern(normalizedQuestion, pattern)) {
        return entry.answer
      }
    }
  }

  return null
}
