const { test } = require('node:test');
const assert = require('node:assert/strict');

// Minimal in-process test — spin up the router without a real server
const express = require('express');
const authRouter = require('../routes/auth');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/', authRouter);
  return app;
}

async function request(app, method, path, body) {
  const http = require('node:http');
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  const bodyStr = body ? new URLSearchParams(body).toString() : '';
  const options = {
    hostname: '127.0.0.1',
    port,
    path,
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(bodyStr),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        server.close();
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// Regression test: missing password must NOT crash (was TypeError before fix)
test('POST /login without password returns 400, not 500', async () => {
  const app = makeApp();
  const res = await request(app, 'POST', '/login', { username: 'admin' });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

// Happy path: correct credentials succeed
test('POST /login with valid credentials returns 200', async () => {
  const app = makeApp();
  const res = await request(app, 'POST', '/login', { username: 'admin', password: 'secret' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

// Edge case: wrong credentials return 401
test('POST /login with wrong password returns 401', async () => {
  const app = makeApp();
  const res = await request(app, 'POST', '/login', { username: 'admin', password: 'wrong' });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});
