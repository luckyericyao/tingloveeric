import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';

const reservation = createServer();
await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const guestPasscode = randomBytes(16).toString('hex');
const ownerPasscode = randomBytes(24).toString('hex');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
  cwd: process.cwd(),
  env: { ...process.env, LOVE_SITE_PASSCODE: guestPasscode, LOVE_OWNER_PASSCODE: ownerPasscode,
    LOVE_SESSION_SECRET: randomBytes(32).toString('hex'),
    KV_REST_API_URL: '', KV_REST_API_TOKEN: '', UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
server.stdout.on('data', (data) => { logs += data; });
server.stderr.on('data', (data) => { logs += data; });
const request = (path, cookie, options = {}) => fetch(`${origin}${path}`, {
  redirect: 'manual', ...options, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...options.headers },
});
const json = (body) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
try {
  let running = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await request('/enter')).status === 200) { running = true; break; } } catch { /* Startup. */ }
    if (server.exitCode !== null) throw new Error('Test server exited');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(running, 'isolated server starts');
  for (const path of ['/', '/cinema', '/coordinates', '/private', '/world', '/notes']) {
    assert.equal((await request(path)).status, 307, `anonymous page denied: ${path}`);
    assert.equal((await request(path, 'love_site_unlocked=true')).status, 307, `legacy cookie denied: ${path}`);
  }
  for (const path of ['/images/home/hero-memory-collage.jpg', '/assets/cats/nono-front.webp', '/api/notes', '/api/world/places']) {
    assert.equal((await request(path)).status, 401, `anonymous resource denied: ${path}`);
  }
  const login = async (passcode) => {
    const result = await request('/api/passcode', null, json({ passcode }));
    assert.equal(result.status, 200);
    const cookie = result.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/i);
    return cookie.split(';')[0];
  };
  const guest = await login(guestPasscode);
  const owner = await login(ownerPasscode);
  assert.equal((await request('/images/home/hero-memory-collage.jpg', guest)).status, 200);
  assert.equal((await request('/private', guest)).status, 200);
  assert.equal((await request('/api/notes', guest, json({ content: 'denied' }))).status, 403);
  assert.equal((await request('/api/world/places', guest, { method: 'PUT' })).status, 403);
  const privateNote = { author: 'not-Eric', date: '2026-09-07', content: 'isolated-test-private', visibility: 'owner' };
  const privateResponse = await request('/api/notes', owner, json(privateNote));
  assert.equal(privateResponse.status, 201);
  assert.equal((await privateResponse.json()).note.author, 'Eric');
  assert.equal((await (await request('/api/notes', guest)).json()).notes.length, 0);
  assert.equal((await request('/api/notes', owner, json({ ...privateNote, content: 'isolated-test-shared', visibility: 'shared' }))).status, 201);
  const visible = (await (await request('/api/notes', guest)).json()).notes;
  assert.equal(visible.length, 1);
  assert.equal(visible[0].content, 'isolated-test-shared');
  assert.equal((await request('/api/notes', owner, { method: 'PUT' })).status, 405);
  assert.equal((await request('/notes', guest)).status, 200);
  assert.ok(!(await (await request('/notes', guest)).text()).includes('<textarea'));
  assert.ok((await (await request('/notes', owner)).text()).includes('<textarea'));
  console.log('PASS: production page/media gates, legacy-cookie rejection, guest/owner isolation, explicit note sharing, visitor read-only page');
} catch (error) {
  console.error(logs.slice(-3000));
  throw error;
} finally {
  if (server.exitCode === null) {
    server.kill('SIGTERM');
    await once(server, 'exit');
  }
}
