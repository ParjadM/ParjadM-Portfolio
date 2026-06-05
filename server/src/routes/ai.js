import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import { AiKnowledge } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import crypto from 'crypto'
import { redisClient } from '../db/redis.js'

const router = Router()

router.post('/chat', async (req, res) => {
  try {
    const { messages, context } = req.body
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    // Rate Limiting: Max 25 prompts per user per 24 hours
    if (redisClient) {
      try {
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
        const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'unknown'
        const rateLimitKey = `rate_limit_chat:${ip}`
        
        const count = await redisClient.incr(rateLimitKey)
        if (count === 1) {
          await redisClient.expire(rateLimitKey, 86400) // 24 hours
        }
        if (count > 25) {
          return res.status(429).json({ error: "You've reached your limit of 25 questions for today. Please come back tomorrow!" })
        }
      } catch (err) {
        console.error('Redis rate limit error:', err)
      }
    }

    // Attempt to fetch from cache first
    let cacheKey = null
    if (redisClient) {
      try {
        const hash = crypto.createHash('sha256').update(JSON.stringify(messages)).digest('hex')
        cacheKey = `ai_chat:${hash}`
        const cachedResponse = await redisClient.get(cacheKey)
        if (cachedResponse) {
          return res.json({ reply: cachedResponse })
        }
      } catch (err) {
        console.error('Redis cache retrieval error:', err)
        // Fallback to Gemini if Redis fails
      }
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
    }

    const ai = new GoogleGenAI({ apiKey })

    // Fetch knowledge base
    let knowledgeContent = ''
    if (currentEngine === 'mongo') {
      const doc = await AiKnowledge.findOne({ key: 'global' }).lean()
      if (doc && doc.content) {
        knowledgeContent = doc.content
      }
    }

    const systemInstruction = `You are a helpful AI assistant for Parjad's portfolio website. 
You answer questions about Parjad based on the following information:
${knowledgeContent ? knowledgeContent : "No specific knowledge provided yet. Please direct them to the contact page."}
${context ? `\n\nAdditional Context: ${context}` : ''}
If asked something outside of this scope, you can politely decline or say you don't know.`

    let replyText = ''
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: messages,
      config: { systemInstruction }
    })
    
    replyText = response.text

    if (redisClient && cacheKey && replyText) {
      try {
        // Cache for 24 hours (86400 seconds)
        await redisClient.set(cacheKey, replyText, { ex: 86400 })
      } catch (err) {
        console.error('Redis cache save error:', err)
      }
    }

    res.json({ reply: replyText })
  } catch (err) {
    console.error('AI Chat Error:', err)
    
    // Cleanly parse rate limit errors so the chatbot speaks a friendly message
    let errorMessage = err.message || 'Failed to generate AI response'
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = "I've been answering a lot of questions lately and need a quick breather! Please wait about a minute and ask me again."
    }
    
    res.status(500).json({ error: errorMessage })
  }
})

router.post('/complexity', async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code string is required' })
    }

    let cacheKey = null
    if (redisClient) {
      try {
        const hash = crypto.createHash('sha256').update(code).digest('hex')
        cacheKey = `ai_complexity_v2:${hash}`
        const cachedResponse = await redisClient.get(cacheKey)
        if (cachedResponse) {
          // Parse JSON if it was stored as string, Upstash auto-parses, but let's handle both
          return res.json(typeof cachedResponse === 'string' ? JSON.parse(cachedResponse) : cachedResponse)
        }
      } catch (err) {
        console.error('Redis cache retrieval error:', err)
      }
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
    }

    const ai = new GoogleGenAI({ apiKey })

    const systemInstruction = `You are an expert static analyzer for code complexity.
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: code }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    })

    let replyData;
    try {
      replyData = JSON.parse(response.text)
    } catch (e) {
      replyData = {
        timeWithoutConstant: "O(?)",
        memoryWithoutConstant: "O(?)",
        explanation: "Could not parse AI response."
      }
    }

    if (redisClient && cacheKey) {
      try {
        // Cache for 7 days
        await redisClient.set(cacheKey, JSON.stringify(replyData), { ex: 604800 })
      } catch (err) {
        console.error('Redis cache save error:', err)
      }
    }

    res.json(replyData)
  } catch (err) {
    console.error('AI Complexity Error:', err)
    // Send back actual error message to debug Vercel issues
    res.status(500).json({ error: err.message || 'Failed to analyze code complexity' })
  }
})

export default router
