const http = require('http');

const req = http.request('http://localhost:5175/api/ai/complexity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Status:', res.statusCode, '\nResponse:', data));
});
req.on('error', e => console.error(e));
req.write(JSON.stringify({ code: 'for(let i=0; i<n; i++) sum++;' }));
req.end();
