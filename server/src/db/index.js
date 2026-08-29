// Database bootstrap point
// Default to in-memory. If MONGODB_URI is provided, switch to Mongo via mongoose.
import { connectMongo } from './mongo.js'

export let currentEngine = 'memory'

export async function initDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    currentEngine = 'memory'
    return { engine: currentEngine }
  }
  try {
    await connectMongo(uri)
    currentEngine = 'mongo'
    return { engine: currentEngine }
  } catch (err) {
    console.error('Mongo connection failed, using in-memory store:', err.message)
    currentEngine = 'memory'
    return { engine: currentEngine, error: err.message }
  }
}
