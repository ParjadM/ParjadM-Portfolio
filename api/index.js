import { createApp } from '../server/src/app.js'

// Vercel serverless function handler
export default async function handler(req, res) {
  const app = await createApp()
  return app(req, res)
}


