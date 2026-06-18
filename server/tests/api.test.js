import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

async function withServer(fn) {
  const app = await createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve, reject) => server.close(err => (err ? reject(err) : resolve())));
  }
}

test('GET /api/health returns ok', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.status, 'ok');
    assert.ok(json.service);
  });
});

test('GET /api/clickup returns count and availability', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/clickup`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(typeof json.count === 'number');
    assert.ok('available' in json);
  });
});

test('GET /api/blog returns posts array', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/blog`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(Array.isArray(json.posts));
  });
});

test('GET /feed.xml returns RSS', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/feed.xml`);
    assert.equal(res.status, 200);
    const ct = res.headers.get('content-type') || '';
    assert.ok(ct.includes('rss') || ct.includes('xml'));
    const text = await res.text();
    assert.ok(text.includes('<rss'));
    assert.ok(text.includes('<channel>'));
  });
});
