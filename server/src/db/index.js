// Database bootstrap: memory mode is only an explicit local-development fallback.
import { connectMongo } from './mongo.js'

export let currentEngine = 'memory'
let connectionPromise

export async function initDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      currentEngine = 'unavailable'
      throw new Error('Production database is not configured')
    }
    currentEngine = 'memory'
    return { engine: currentEngine }
  }
  // Concurrent requests share one connection attempt; rejected attempts are retryable.
  if (!connectionPromise) {
    connectionPromise = connectMongo(uri)
      .then(() => {
        currentEngine = 'mongo'
        return { engine: currentEngine }
      })
      .catch(err => {
        currentEngine = 'unavailable'
        throw err
      })
      .finally(() => { connectionPromise = undefined })
  }
  return connectionPromise
}
