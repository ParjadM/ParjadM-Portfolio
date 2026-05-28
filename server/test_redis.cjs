const { Redis } = require('@upstash/redis');
try {
  const url = '"https://test.upstash.io"';
  const token = '"token"';
  const redis = new Redis({ url, token });
  console.log('No error on init');
} catch (err) {
  console.log('Init error:', err.message);
}
