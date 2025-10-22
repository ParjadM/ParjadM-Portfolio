import { createApp } from '../server/src/app.js'

let appPromise

// Vercel serverless function handler (memoized app to reduce cold starts)
export default async function handler(req, res) {
  appPromise ||= createApp()
  const app = await appPromise
  return app(req, res)
}


