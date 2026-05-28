import { Redis } from '@upstash/redis'
import { config } from '../config.js'

let redisClient = null

if (config.upstashRedisRestUrl && config.upstashRedisRestToken) {
  try {
    redisClient = new Redis({
      url: config.upstashRedisRestUrl,
      token: config.upstashRedisRestToken,
    })
    console.log('Upstash Redis client initialized successfully.')
  } catch (error) {
    console.error('Failed to initialize Upstash Redis client:', error)
  }
} else {
  console.warn('Upstash Redis credentials not provided, bypassing Redis caching.')
}

export { redisClient }
