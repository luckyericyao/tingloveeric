import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes, randomUUID } from 'node:crypto';
import { startMockKv, stopTestServer } from './fixtures/kv_mock.mjs';

let mapWriteRace = null;
const kv = process.env.QA_NO_STORAGE === '1' ? null : await startMockKv({
  beforeCommand: async ([operation]) => {
    if (operation !== 'EVAL' || !mapWriteRace) return;
    const race = mapWriteRace;
    if (++race.arrivals === 2) race.release();
    await race.ready;
  },
});

const reservation = createServer();
await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const guestPasscode = randomBytes(16).toString('hex');
const ownerPasscode = randomBytes(24).toString('hex');
const environment = { ...process.env, LOVE_SITE_PASSCODE: guestPasscode, LOVE_OWNER_PASSCODE: ownerPasscode,
    LOVE_SESSION_SECRET: randomBytes(32).toString('hex'),
    KV_REST_API_URL: kv?.url || '', KV_REST_API_TOKEN: kv?.token || '', UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '' };
let logs = '';
const start = () => {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
    cwd: process.cwd(), env: environment, stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
  return child;
};
let server = start();
const request = (path, cookie, options = {}) => fetch(`${origin}${path}`, {
  redirect: 'manual', ...options, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...options.headers },
});
const json = (body) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const waitForServer = async () => {
  let running = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await request('/enter')).status === 200) { running = true; break; } } catch { /* Startup. */ }
    if (server.exitCode !== null || server.signalCode !== null) throw new Error('Test server exited');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(running, 'isolated server starts');
};
try {
  await waitForServer();
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
  assert.ok((await (await request('/private', guest)).text()).includes('读到这里就好，不必回信。'));
  assert.ok((await (await request('/private', owner)).text()).includes('今天有一句话想留下，就写在这里'));
  const privateProfile = await request('/him', guest);
  assert.equal(privateProfile.status, 307);
  assert.ok(privateProfile.headers.get('location').endsWith('/private'));
  assert.equal((await request('/him', owner)).status, 200);
  const guestMap = await (await request('/world', guest)).text();
  assert.ok(!guestMap.includes('data-testid="world-edit"'));
  assert.ok(!guestMap.includes('<textarea'));
  assert.equal((await request('/api/passcode', null, { ...json({ passcode: guestPasscode }), headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' } })).status, 403);
  assert.equal((await request('/api/notes', owner, { ...json({ content: 'cross-origin-denied' }), headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' } })).status, 403);
  assert.equal((await request('/api/notes', guest, json({ content: 'denied' }))).status, 403);
  assert.equal((await request('/api/world/places', guest, { method: 'PUT' })).status, 403);
  const mapPath = '/api/world/places';
  const mapKey = 'tingloveeric:world-map';
  const emptyMap = { overrides: {}, customPlaces: [], revision: '0'.repeat(64) };
  assert.equal((await request(mapPath, guest, json(emptyMap))).status, 403);
  assert.equal((await request(mapPath, owner, { ...json(emptyMap), headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' } })).status, 403);
  const mapRead = await request(mapPath, owner);
  let savedMap;
  if (!kv) {
    assert.equal(mapRead.status, 503);
    assert.equal((await request(mapPath, owner, json(emptyMap))).status, 503);
    console.log('PASS: map storage unavailable refuses reads/writes instead of reporting an in-memory save');
  } else {
    assert.equal(mapRead.status, 200);
    assert.equal(kv.store.has(mapKey), false, 'opening an empty map performs no write');
    assert.deepEqual((await mapRead.json()).customPlaces, []);
    const place = id => ({
      id, name: id, country: 'QA', status: 'wishlist', note: 'isolated map test', wish: 'isolated map test',
      lat: 1, lng: 2, image: { id: 'fixture', src: '/images/travel/guangzhou.jpg', alt: 'QA', caption: 'QA', category: 'QA' },
    });
    const legacy = { overrides: {}, customPlaces: [place('legacy-place')] };
    const legacyValue = JSON.stringify(legacy);
    kv.store.set(mapKey, legacyValue);
    const before = await (await request(mapPath, owner)).json();
    assert.match(before.revision, /^[a-f0-9]{64}$/);
    assert.deepEqual(before.customPlaces, legacy.customPlaces);
    assert.equal(kv.store.get(mapKey), legacyValue, 'reads do not rewrite legacy map data');
    assert.equal((await request(mapPath, owner, json(legacy))).status, 400, 'old unversioned client cannot overwrite');
    assert.equal((await request(mapPath, owner, json({ ...before, customPlaces: [null] }))).status, 400);
    assert.equal((await request(mapPath, owner, json({ ...before, customPlaces: [place('same'), place('same')] }))).status, 400);
    assert.equal(kv.store.get(mapKey), legacyValue);
    const drafts = ['first-editor', 'second-editor'].map(id => ({ ...before, customPlaces: [...legacy.customPlaces, place(id)] }));
    let release;
    const ready = new Promise(resolve => { release = resolve; });
    const race = { arrivals: 0, release, ready };
    mapWriteRace = race;
    const writes = await Promise.all(drafts.map(draft => request(mapPath, owner, json(draft))));
    mapWriteRace = null;
    assert.equal(race.arrivals, 2, 'both writers reached the atomic compare after reading the same old value');
    assert.deepEqual(writes.map(write => write.status).sort(), [200, 409]);
    const winner = writes.findIndex(write => write.status === 200);
    const firstSave = await writes[winner].json();
    assert.notEqual(firstSave.revision, before.revision);
    assert.deepEqual((await (await request(mapPath, owner, json(drafts[winner]))).json()).customPlaces, drafts[winner].customPlaces, 'lost acknowledgement can be retried');
    const secondSave = await request(mapPath, owner, json({
      ...firstSave, customPlaces: [...firstSave.customPlaces, drafts[1 - winner].customPlaces[1]],
    }));
    assert.equal(secondSave.status, 200);
    savedMap = await secondSave.json();
    assert.deepEqual(savedMap.customPlaces.map(place => place.id).sort(), ['first-editor', 'legacy-place', 'second-editor']);
    assert.deepEqual((await (await request(mapPath, guest)).json()).customPlaces, savedMap.customPlaces);
    const savedValue = kv.store.get(mapKey);
    kv.store.set(mapKey, '{invalid fixture JSON');
    assert.equal((await request(mapPath, owner)).status, 500);
    assert.equal((await request(mapPath, owner, json(savedMap))).status, 500);
    assert.equal(kv.store.get(mapKey), '{invalid fixture JSON', 'a corrupt stored map is never overwritten by a client');
    kv.store.set(mapKey, savedValue);
    console.log('PASS: map legacy read, no read-side writes, simultaneous 200/409, replay, rebase, guest read-only, corrupt data retained');
  }
  const privateNote = { author: 'not-Eric', date: '2026-09-07', content: 'isolated-test-private', visibility: 'owner' };
  const privateResponse = await request('/api/notes', owner, json(privateNote));
  assert.equal(privateResponse.status, kv ? 201 : 503);
  if (kv) assert.equal((await privateResponse.json()).note.author, 'Eric');
  const guestNotes = await request('/api/notes', guest);
  assert.equal(guestNotes.status, kv ? 200 : 503);
  if (kv) assert.equal((await guestNotes.json()).notes.length, 0);
  assert.equal((await request('/api/notes', owner, json({ ...privateNote, content: 'isolated-test-shared', visibility: 'shared' }))).status, kv ? 201 : 503);
  const visible = (await (await request('/api/notes', guest)).json()).notes;
  assert.equal(visible?.length ?? 0, kv ? 1 : 0);
  if (kv) assert.equal(visible[0].content, 'isolated-test-shared');
  else assert.equal((await (await request('/api/notes', owner)).json()).persistence, 'unavailable');
  if (kv) {
    const retried = { ...privateNote, id: randomUUID(), content: 'isolated-idempotent-letter' };
    const responses = await Promise.all(Array.from({ length: 8 }, () => request('/api/notes', owner, json(retried))));
    for (const response of responses) assert.equal(response.status, 201);
    let notes = (await (await request('/api/notes', owner)).json()).notes;
    assert.equal(notes.filter(note => note.id === retried.id).length, 1);
    assert.equal((await request('/api/notes', owner, json({ ...retried, content: 'conflicting-letter' }))).status, 409);
    const additions = Array.from({ length: 12 }, () => ({ ...privateNote, id: randomUUID(), content: 'isolated-concurrent-letter' }));
    for (const response of await Promise.all(additions.map(note => request('/api/notes', owner, json(note))))) assert.equal(response.status, 201);
    notes = (await (await request('/api/notes', owner)).json()).notes;
    for (const note of additions) assert.ok(notes.some(saved => saved.id === note.id));
    assert.equal((await request('/api/notes', owner, json({ ...privateNote, id: 'invalid-id' }))).status, 400);
    console.log('PASS: production API concurrent inserts, idempotent retries, conflicting identity and invalid ID rejection');
    const previousProcess = server.pid;
    await stopTestServer(server);
    server = start();
    assert.notEqual(server.pid, previousProcess);
    await waitForServer();
    const reopened = await (await request('/api/notes', owner)).json();
    assert.deepEqual(reopened.notes, notes, 'saved letters survive application process restart');
    assert.deepEqual((await (await request('/api/notes', guest)).json()).notes, visible, 'sharing permissions survive restart');
    assert.deepEqual(await (await request(mapPath, guest)).json(), savedMap, 'confirmed map and version survive application restart');
    console.log('PASS: notes and guest visibility survive application restart with the same isolated Redis fixture');
  }
  assert.equal((await request('/api/notes', owner, { method: 'PUT' })).status, 405);
  assert.equal((await request('/notes', guest)).status, 200);
  assert.ok(!(await (await request('/notes', guest)).text()).includes('<textarea'));
  assert.ok((await (await request('/notes', owner)).text()).includes('<textarea'));
  console.log(kv
    ? 'PASS: production page/media gates, legacy-cookie rejection, guest/owner isolation, explicit note sharing, visitor read-only page'
    : 'PASS: missing storage returns 503 for reads and writes, no false empty archive or successful save, guest mutation denied');
} catch (error) {
  console.error(logs.slice(-3000));
  throw error;
} finally {
  await kv?.close();
  await stopTestServer(server);
}
