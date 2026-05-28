require('dotenv').config();
console.log('Gemini:', process.env.GEMINI_API_KEY);
console.log('Upstash URL:', process.env.UPSTASH_REDIS_REST_URL);
console.log('Upstash Token:', process.env.UPSTASH_REDIS_REST_TOKEN);
