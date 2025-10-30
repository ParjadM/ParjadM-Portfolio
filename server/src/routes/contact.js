import express from 'express'
import nodemailer from 'nodemailer'
import { RateLimit } from '../db/mongo.js'

const router = express.Router()

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

async function checkRateLimit(key, limit = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now()
  const doc = await RateLimit.findOne({ key })
  if (!doc) {
    await RateLimit.create({ key, windowStart: new Date(now), count: 1 })
    return true
  }
  const start = doc.windowStart?.getTime?.() || new Date(doc.windowStart).getTime()
  if (now - start > windowMs) {
    doc.windowStart = new Date(now)
    doc.count = 1
    await doc.save()
    return true
  }
  if (doc.count >= limit) return false
  doc.count += 1
  await doc.save()
  return true
}

router.post('/', async (req, res) => {
  const { name, email, subject, message, company } = req.body || {}

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Honeypot (bots fill hidden 'company')
  if (company) {
    return res.json({ ok: true })
  }

  // Basic per-IP rate limit
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || 'unknown'
  const allowed = await checkRateLimit(`contact:${ip}`, Number(process.env.CONTACT_LIMIT || 5), Number(process.env.CONTACT_WINDOW_MS || 60*60*1000))
  if (!allowed) return res.status(429).json({ error: 'Too many requests' })

  try {
    const transporter = createTransporter()

    const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER
    const appName = process.env.APP_NAME || 'Portfolio Contact'

    const mailOptions = {
      from: `${appName} <${process.env.SMTP_USER}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="margin:0 0 12px;">New contact message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return res.json({ ok: true })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Contact mail error:', err)
    return res.status(500).json({ error: 'Failed to send message' })
  }
})

export default router


