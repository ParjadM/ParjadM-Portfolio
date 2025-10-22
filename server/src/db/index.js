// Database bootstrap point
// Default to in-memory. If MONGODB_URI is provided, switch to Mongo via mongoose.
import { randomUUID } from 'crypto'
import { connectMongo, Item } from './mongo.js'

export class InMemoryStore {
  constructor() {
    this.items = []
  }

  async list() {
    return this.items
  }

  async add(item) {
    this.items.push({ id: randomUUID(), ...item })
    return this.items[this.items.length - 1]
  }
}

class MongoRepository {
  async list() {
    const docs = await Item.find({}).sort({ createdAt: -1 }).lean()
    return docs
  }

  async add(item) {
    const created = await Item.create(item)
    return created.toObject()
  }
}

export let db = new InMemoryStore()
export let currentEngine = 'memory'

export async function initDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    // Using in-memory store
    currentEngine = 'memory'
    return { engine: currentEngine }
  }
  try {
    await connectMongo(uri)
    db = new MongoRepository()
    currentEngine = 'mongo'
    return { engine: currentEngine }
  } catch (err) {
    // Fallback to in-memory if connection fails
    // eslint-disable-next-line no-console
    console.error('Mongo connection failed, using in-memory store:', err.message)
    db = new InMemoryStore()
    currentEngine = 'memory'
    return { engine: currentEngine, error: err.message }
  }
}


