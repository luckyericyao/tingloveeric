import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { checkAudioJourney } from './audio_browser_checks.mjs';
import { checkFilmComposition } from './film_composition_checks.mjs';

const reservation = createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const passcode = randomBytes(16).toString('hex');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
  env: { ...process.env, LOVE_SITE_PASSCODE: passcode, LOVE_OWNER_PASSCODE: randomBytes(24).toString('hex'),
    LOVE_SESSION_SECRET: randomBytes(32).toString('hex'), KV_REST_API_URL: '', KV_REST_API_TOKEN: '',
    UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
server.stdout.on('data', data => { logs += data; });
server.stderr.on('data', data => { logs += data; });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(`${origin}/enter`)).ok) { ready = true; break; } } catch { /* Startup. */ }
    if (server.exitCode !== null) throw new Error('Server exited');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready);
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const output = '.audit/current-map';
  await mkdir(output, { recursive: true });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
    const auth = await context.request.post(`${origin}/api/passcode`, { headers: { Origin: origin }, data: { passcode } });
    assert.equal(auth.status(), 200);
    if (process.env.QA_FILM === '1') {
      await checkFilmComposition(context, origin, output, viewport.width);
    }
    if (process.env.QA_AUDIO === '1' && viewport.width === 1440) {
      await checkAudioJourney(context, origin, output);
    }
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/world`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="world-map"] svg.rsm-svg').waitFor();
    await page.locator('aside img').evaluate(image => image.decode());
    assert.equal(await page.locator('[data-testid="world-edit"]').count(), 0);
    assert.equal(await page.locator('textarea').count(), 0);
    const map = await page.locator('[data-testid="world-map"]').boundingBox();
    assert.ok(map.y < viewport.height * .4, 'map starts in first viewport');
    const photo = await page.locator('aside img').boundingBox();
    assert.ok(photo.y < viewport.height, 'photograph starts in first viewport');
    assert.ok(photo.width > viewport.width * (viewport.width > 700 ? .4 : .9), 'large photograph');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
    await page.screenshot({ path: `${output}/${viewport.width}-initial.png`, fullPage: true });
    await page.getByRole('tab', { name: '美国', exact: true }).click();
    const marker = page.locator('g[role="button"][aria-label^="波士顿"]');
    await marker.click();
    await page.locator('aside h3').filter({ hasText: '波士顿' }).waitFor();
    await page.locator('aside img').evaluate(image => image.decode());
    await page.screenshot({ path: `${output}/${viewport.width}-boston.png`, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}x${viewport.height}: first-screen map/photo, Boston selection, decoded images, no guest editor or overflow`);
    await context.close();
  }
} catch (error) {
  console.error(logs.slice(-2000));
  throw error;
} finally {
  await browser?.close();
  if (server.exitCode === null) { server.kill('SIGTERM'); await once(server, 'exit'); }
}
