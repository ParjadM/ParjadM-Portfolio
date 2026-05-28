import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import { AiKnowledge } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'

const router = Router()

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
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

    res.json({ reply: response.text })
  } catch (err) {
    console.error('AI Chat Error:', err)
    res.status(500).json({ error: 'Failed to generate AI response' })
  }
})

export default router
