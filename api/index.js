import { createApp } from '../server/src/app.js'

// Ensure Node runtime (not Edge) and a modern version
export const config = { runtime: 'nodejs20.x' }

let appPromise

// Vercel serverless function handler (memoized app to reduce cold starts)
export default async function handler(req, res) {
  try {
    appPromise ||= createApp()
    const app = await appPromise
    return app(req, res)
  } catch (err) {
    // Surface the error as JSON instead of a generic crash page
    // eslint-disable-next-line no-console
    console.error('API handler error:', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Serverless handler error', message: err?.message || String(err) }))
  }
}


