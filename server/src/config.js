export const config = {
  port: Number(process.env.PORT || 5175),
  nodeEnv: process.env.NODE_ENV || 'development',
  // Add database-related env later: DATABASE_URL, etc.
  mongoUri: process.env.MONGODB_URI,
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
}


