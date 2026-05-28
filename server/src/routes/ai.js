import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import { AiKnowledge } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import crypto from 'crypto'
import { redisClient } from '../db/redis.js'

const router = Router()

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
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
If asked something outside of this scope, you can politely decline or say you don't know.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
        systemInstruction: systemInstruction,
      }
    })

    const replyText = response.text

    if (redisClient && cacheKey) {
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
    res.status(500).json({ error: 'Failed to generate AI response' })
  }
})

export default router
