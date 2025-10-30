import express from 'express'
import nodemailer from 'nodemailer'

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

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body || {}

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

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


