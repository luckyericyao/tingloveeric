import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { checkAudioJourney, checkAudioRoutes } from './audio_browser_checks.mjs';
import { checkFilmComposition } from './film_composition_checks.mjs';
import { checkFilmFallback } from './film_fallback_checks.mjs';
import { checkAudioRecovery, checkManualAudioResume, checkOpeningAudioRecovery } from './audio_recovery_checks.mjs';
import { startMockKv, stopTestServer } from './fixtures/kv_mock.mjs';
import { checkOpening } from './opening_browser_checks.mjs';
import { checkWorldWrites } from './world_write_checks.mjs';

const kv = process.env.QA_LETTERS === '1' || process.env.QA_MAP_WRITES === '1' ? await startMockKv() : null;
const reservation = createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const passcode = randomBytes(16).toString('hex');
const ownerPasscode = randomBytes(24).toString('hex');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
  env: { ...process.env, LOVE_SITE_PASSCODE: passcode, LOVE_OWNER_PASSCODE: ownerPasscode,
    LOVE_SESSION_SECRET: randomBytes(32).toString('hex'), KV_REST_API_URL: kv?.url || '', KV_REST_API_TOKEN: kv?.token || '',
    UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
server.stdout.on('data', data => { logs += data; });
server.stderr.on('data', data => { logs += data; });
let browser;
let browserServer;
const output = process.env.QA_OUTPUT || '.audit/current-map';
const viewports = process.env.QA_VIEWPORT === '390'
  ? [{ width: 390, height: 844 }]
  : [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const startedAt = new Date().toISOString();
const buildId = (await readFile('.next/BUILD_ID', 'utf8')).trim();
let failure = null;
await mkdir(output, { recursive: true });
await writeFile(`${output}/result.json`, JSON.stringify({ status: 'running', pid: process.pid, startedAt, buildId }, null, 2));
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(`${origin}/enter`)).ok) { ready = true; break; } } catch { /* Startup. */ }
    if (server.exitCode !== null) throw new Error('Server exited');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready);
  browserServer = await chromium.launchServer({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, host: '127.0.0.1',
  });
  browser = await chromium.connect(browserServer.wsEndpoint());
  await mkdir(output, { recursive: true });
  if (process.env.QA_OPENING === '1') {
    const cold = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await cold.request.post(`${origin}/api/passcode`, { headers: { Origin: origin }, data: { passcode } });
    const firstPaint = await cold.newPage();
    await firstPaint.goto(origin, { waitUntil: 'networkidle' });
    assert.ok(await firstPaint.evaluate(() => document.documentElement.scrollHeight <= innerHeight), 'server-rendered opening is scroll-locked before hydration');
    assert.equal(await firstPaint.getByRole('link', { name: '进入故事', exact: true }).count(), 0);
    await firstPaint.screenshot({ path: `${output}/opening-before-hydration.png` });
    await cold.close();
    console.log('PASS first paint: opening remains one screen with site JavaScript disabled');
  }
  for (const viewport of viewports) {
    const options = { viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 };
    if (process.env.QA_AUDIO_ROUTES === '1') {
      const visitor = await browser.newContext(options);
      try {
        await checkAudioRoutes(await visitor.newPage(), origin, passcode);
      } finally {
        await visitor.close();
      }
    }
    const context = await browser.newContext(options);
    const auth = await context.request.post(`${origin}/api/passcode`, { headers: { Origin: origin }, data: { passcode } });
    assert.equal(auth.status(), 200);
    if (process.env.QA_OPENING === '1') await checkOpening(context, origin, output, viewport.width);
    if (process.env.QA_RECOVERY === '1') {
      await checkOpeningAudioRecovery(context, origin, output);
      await checkManualAudioResume(context, origin);
      await checkAudioRecovery(context, origin, output);
    }
    if (process.env.QA_FILM === '1') {
      await checkFilmComposition(context, origin, output, viewport.width);
    }
    if (process.env.QA_FALLBACK === '1') await checkFilmFallback(context, origin, output, viewport.width);
    if (process.env.QA_MAP_WRITES === '1') await checkWorldWrites(browser, origin, ownerPasscode, output, viewport);
    if (process.env.QA_AUDIO === '1' && viewport.width === (process.env.QA_AUDIO_MOBILE === '1' ? 390 : 1440)) {
      await checkAudioJourney(context, origin, output);
    }
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (process.env.QA_CATS === '1') {
      await page.goto(`${origin}/her`, { waitUntil: 'networkidle' });
      const headingBounds = await page.getByTestId('cats-heading').boundingBox();
      const portraitsBounds = await page.getByTestId('cat-portraits').boundingBox();
      assert.ok(Math.abs((headingBounds.x + headingBounds.width / 2) - viewport.width / 2) < 2, 'cat heading is centered');
      assert.ok(Math.abs((portraitsBounds.x + portraitsBounds.width / 2) - viewport.width / 2) < 2, 'cat portraits share the heading axis');
      if (viewport.width > 700) assert.ok(portraitsBounds.width <= 922, 'desktop cats stay close together');
      await page.waitForFunction(() => [...document.querySelectorAll('[data-auto-blinks]')].every(cat => Number(cat.dataset.autoBlinks) >= 1), null, { timeout: 7000 });
      const automaticCounts = await page.locator('[data-auto-blinks]').evaluateAll(cats => cats.map(cat => Number(cat.dataset.autoBlinks)));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(8000);
      assert.deepEqual(await page.locator('[data-auto-blinks]').evaluateAll(cats => cats.map(cat => Number(cat.dataset.autoBlinks))), automaticCounts, 'reduced motion stops automatic blinking');
      for (const name of ['小yeah', 'Nono']) {
        const cat = page.getByRole('button', { name: `轻轻摸摸${name}` });
        await page.waitForFunction(name => document.querySelector(`[aria-label="轻轻摸摸${name}"]`)?.dataset.ready === 'true', name);
        const before = await cat.boundingBox();
        if (viewport.width === 390) await cat.tap();
        else { await cat.focus(); await page.keyboard.press('Enter'); }
        assert.equal(await cat.getAttribute('data-blinking'), 'true');
        await page.screenshot({ path: `${output}/cat-${viewport.width}-${name}.png` });
        await page.waitForFunction(name => document.querySelector(`[aria-label="轻轻摸摸${name}"]`)?.dataset.blinking === 'false', name);
        assert.deepEqual(await cat.boundingBox(), before, 'cat does not shift or scale');
        await cat.evaluate(el => { for (let i = 0; i < 10; i++) el.click(); });
        await page.waitForFunction(name => document.querySelector(`[aria-label="轻轻摸摸${name}"]`)?.dataset.blinking === 'false', name);
      }
      console.log(`PASS cats ${viewport.width}px: decoded blink, touch/keyboard, repeat clicks, stable reduced-motion layout`);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    if (process.env.QA_VIEWER === '1') {
      await page.goto(`${origin}/coordinates`, { waitUntil: 'networkidle' });
      const opener = page.getByRole('button', { name: '沉浸查看：那时候她叫 Hanni', exact: true });
      await opener.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      assert.ok(await dialog.evaluate(el => el.matches(':modal')));
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)));
      }
      await page.keyboard.press('ArrowRight');
      await page.getByRole('dialog', { name: '查看图片：她最早向外展示的生活' }).waitFor();
      await dialog.locator('img').evaluate(image => image.decode());
      if (viewport.width === 390) {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 290, y: 270 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 110, y: 275 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.getByRole('dialog', { name: '查看图片：后来留下的数字遗迹' }).waitFor();
        await cdp.detach();
      }
      await dialog.locator('img').evaluate(image => image.decode());
      assert.ok(await dialog.evaluate(el => el.scrollHeight <= el.clientHeight + 1));
      await page.screenshot({ path: `${output}/viewer-${viewport.width}.png` });
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(), 0);
      assert.ok(await opener.evaluate(el => el === document.activeElement));
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      console.log(`PASS viewer ${viewport.width}px: modal focus, keyboard navigation, close restoration, ${viewport.width === 390 ? 'touch swipe' : 'image decode'}`);
    }
    if (process.env.QA_LETTERS === '1') {
      const owner = await browser.newContext({ viewport });
      await owner.request.post(`${origin}/api/passcode`, { headers: { Origin: origin }, data: { passcode: ownerPasscode } });
      const writing = await owner.newPage();
      await writing.route('**/api/notes', route => route.request().method() === 'GET'
        ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: '信件读取暂不可用。' }) }) : route.continue());
      await writing.goto(`${origin}/notes`, { waitUntil: 'networkidle' });
      const body = writing.getByRole('textbox', { name: '写下此刻' });
      const sharing = writing.getByRole('checkbox', { name: '允许受邀者阅读这封信' });
      const readAgain = writing.getByRole('button', { name: '重新读取信件' });
      await readAgain.waitFor();
      assert.equal(await writing.locator('.archive-empty-note').count(), 0, 'read failure is not presented as an empty archive');
      await body.fill('重新读取信件时，不要清空正在写的草稿。');
      await writing.unroute('**/api/notes');
      await readAgain.click();
      await readAgain.waitFor({ state: 'detached' });
      assert.equal(await body.inputValue(), '重新读取信件时，不要清空正在写的草稿。');
      assert.equal(await sharing.isChecked(), false);
      await body.fill('浏览器验收用信件，不属于真实故事。');
      await sharing.check();
      await writing.getByRole('button', { name: '收进未寄出的信' }).click();
      await writing.getByText('已保存为 Eric 的记录。', { exact: true }).waitFor();
      assert.equal(await sharing.isChecked(), false, 'every new letter starts private');
      assert.equal(await body.inputValue(), '');
      await writing.route('**/api/notes', route => route.request().method() === 'POST'
        ? route.fulfill({ status: 503, body: '{}' }) : route.continue());
      await body.fill('保存失败时，这段文字应留在信纸上。');
      await writing.getByRole('button', { name: '收进未寄出的信' }).click();
      await writing.getByRole('alert').waitFor();
      assert.equal(await body.inputValue(), '保存失败时，这段文字应留在信纸上。');
      await writing.unroute('**/api/notes');
      await writing.route('**/api/notes', route => route.request().method() === 'POST'
        ? route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ notes: [], persistence: 'memory' }) }) : route.continue());
      await body.fill('进程内存不等于长期保存，这段文字也不能被清空。');
      await writing.getByRole('button', { name: '收进未寄出的信' }).click();
      await writing.getByRole('alert').waitFor();
      assert.equal(await body.inputValue(), '进程内存不等于长期保存，这段文字也不能被清空。');
      await writing.unroute('**/api/notes');
      let loseResponse = true;
      await writing.route('**/api/notes', async route => {
        if (route.request().method() === 'POST' && loseResponse) {
          loseResponse = false;
          const saved = await route.fetch();
          assert.equal(saved.status(), 201);
          await route.abort('failed');
        } else await route.continue();
      });
      const retryText = `保存后断线再重试，不能重复的验收信件 ${viewport.width}`;
      await body.fill(retryText);
      await writing.getByRole('button', { name: '收进未寄出的信' }).click();
      await writing.getByRole('alert').waitFor();
      assert.equal(await body.inputValue(), retryText);
      await writing.getByRole('button', { name: '收进未寄出的信' }).click();
      await writing.getByText('已保存为 Eric 的记录。', { exact: true }).waitFor();
      const retryNotes = (await (await owner.request.get(`${origin}/api/notes`)).json()).notes;
      assert.equal(retryNotes.filter(note => note.content === retryText).length, 1, 'network retry does not duplicate a saved letter');
      assert.ok(await writing.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await writing.evaluate(() => window.scrollTo(0, 0));
      await writing.screenshot({ path: `${output}/letter-${viewport.width}.png`, fullPage: true });
      await owner.close();
      console.log(`PASS letters at ${viewport.width}px: explicit sharing resets, failed or non-durable save retains text, no overflow`);
    }
    if (process.env.QA_ROOMS === '1') {
      for (const route of ['private', 'coordinates', 'her', 'notes']) {
        await page.goto(`${origin}/${route}`, { waitUntil: 'networkidle' });
        await page.locator('main').waitFor();
        for (const image of await page.locator('main img').all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(image => Promise.race([
            image.decode(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Image decode timeout')), 15000)),
          ]));
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} fits viewport`);
        if (route === 'notes') assert.equal(await page.locator('textarea').count(), 0);
        if (route === 'coordinates') {
          const tender = page.getByRole('region', { name: '甜蜜的瞬间' });
          await tender.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          assert.equal(await tender.locator('blockquote span').count(), 3);
          await tender.screenshot({ path: `${output}/tender-${viewport.width}.png` });
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        await page.screenshot({ path: `${output}/room-${viewport.width}-${route}.png`, fullPage: true });
      }
      console.log(`PASS rooms at ${viewport.width}px: images decode, guest letters read-only, no overflow`);
    }
    const mapSamples = [];
    const sampleMap = async stage => {
      if (viewport.width !== 390) return;
      mapSamples.push({ stage, ...await page.evaluate(() => ({
        scrollY,
        photo: document.querySelector('aside img')?.getBoundingClientRect().toJSON(),
        article: document.querySelector('#world-photo')?.getBoundingClientRect().toJSON(),
        activeElement: document.activeElement?.tagName,
        photoState: document.querySelector('[data-photo-status]')?.getAttribute('data-photo-status'),
      })) });
      await writeFile(`${output}/map-scroll-samples.json`, JSON.stringify(mapSamples, null, 2));
    };
    await page.goto(`${origin}/world`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="world-map"] svg.rsm-svg').waitFor();
    await page.locator('aside img').evaluate(image => image.decode());
    await page.waitForFunction(() => {
      const image = document.querySelector('aside img');
      return image && getComputedStyle(image).opacity === '1';
    });
    assert.equal(await page.locator('[data-testid="world-edit"]').count(), 0);
    assert.equal(await page.locator('textarea').count(), 0);
    const map = await page.locator('[data-testid="world-map"]').boundingBox();
    assert.ok(map.y < viewport.height * .4, `map starts in first viewport: y=${map.y}`);
    const photo = await page.locator('aside img').boundingBox();
    assert.ok(photo.y < viewport.height, 'photograph starts in first viewport');
    assert.ok(photo.width > viewport.width * (viewport.width > 700 ? .4 : .9), 'large photograph');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
    await page.screenshot({ path: `${output}/${viewport.width}-initial.png`, fullPage: true });
    if (process.env.QA_PHOTO === '1') await page.route('**/images/travel/boston.jpg', route => route.abort('failed'));
    const usTab = page.getByRole('tab', { name: '美国', exact: true });
    if (viewport.width === 390) await usTab.tap();
    else await usTab.click();
    const marker = page.locator('g[role="button"][aria-label^="波士顿"]');
    if (viewport.width === 390) await marker.tap();
    else await marker.click();
    await page.locator('aside h3').filter({ hasText: '波士顿' }).waitFor();
    if (viewport.width === 390) await page.waitForFunction(() => {
      const photo = document.querySelector('aside img').getBoundingClientRect();
      return photo.top >= 65 && photo.top < 150 && photo.bottom <= innerHeight;
    });
    await sampleMap('selected-photo-visible');
    assert.equal(await page.locator('aside').getByText('未来某天', { exact: true }).count(), 0, 'undated wish does not invent a date');
    if (process.env.QA_PHOTO === '1') {
      const retry = page.getByRole('button', { name: '重试照片' });
      await retry.waitFor();
      const frame = page.locator('[data-photo-status]');
      const documentBounds = element => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height };
      };
      const beforeRetry = await frame.evaluate(documentBounds);
      assert.equal(await frame.getAttribute('data-photo-status'), 'error');
      await page.unroute('**/images/travel/boston.jpg');
      await sampleMap('before-retry');
      await retry.click();
      await sampleMap('after-retry');
      await page.locator('[data-photo-status="ready"]').waitFor();
      await sampleMap('after-image-ready');
      assert.deepEqual(await frame.evaluate(documentBounds), beforeRetry, 'photo recovery preserves document layout during intentional scrolling');
      console.log(`PASS photo recovery ${viewport.width}px: failed city image, explicit retry, stable frame`);
    }
    await page.locator('aside img').evaluate(image => image.decode());
    await page.waitForFunction(() => {
      const image = document.querySelector('aside img');
      return image && getComputedStyle(image).opacity === '1';
    });
    await sampleMap('after-image-visible');
    if (viewport.width === 390) await page.waitForFunction(() => {
      const photo = document.querySelector('aside img').getBoundingClientRect();
      return photo.top >= 65 && photo.top < 150 && photo.bottom <= innerHeight;
    });
    if (viewport.width === 390) {
      await page.screenshot({ path: `${output}/390-selected-photo.png` });
    }
    await page.screenshot({ path: `${output}/${viewport.width}-boston.png`, fullPage: true });
    if (viewport.width === 390) {
      await page.locator('[data-testid="world-map"]').scrollIntoViewIfNeeded();
      const picker = page.getByRole('combobox', { name: '选择城市' });
      const bounds = await picker.boundingBox();
      assert.ok(bounds.width >= 44 && bounds.height >= 44, 'uncluttered touch alternative has a 44px target');
      await picker.selectOption('miami');
      await page.locator('aside h3').filter({ hasText: '迈阿密' }).waitFor();
      await page.waitForFunction(() => {
        const photo = document.querySelector('aside img').getBoundingClientRect();
        return photo.top >= 65 && photo.top < 150 && photo.bottom <= innerHeight;
      });
      assert.equal(await picker.inputValue(), 'miami');
      assert.ok((await page.locator('aside img').getAttribute('src')).endsWith('/miami.jpg'));
      await page.locator('aside img').evaluate(image => image.decode());
      console.log('PASS mobile map: 48px city picker, selection reveals the large photo without manual scrolling');
    } else {
      const keyboardCity = page.locator('g[role="button"][aria-label^="迈阿密"]');
      await keyboardCity.focus();
      await page.keyboard.press('Enter');
      await page.locator('aside h3').filter({ hasText: '迈阿密' }).waitFor();
      console.log('PASS desktop map: city markers activate by keyboard');
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}x${viewport.height}: first-screen map/photo, Boston selection, decoded images, no guest editor or overflow`);
    await context.close();
  }
} catch (error) {
  failure = error.message || String(error);
  console.error(error);
  await writeFile(`${output}/result.json`, JSON.stringify({
    status: 'failed', cleanup: 'pending', startedAt, buildId, error: failure, stack: error.stack,
  }, null, 2));
  const page = browser?.contexts().flatMap(context => context.pages()).at(-1);
  if (page && !page.isClosed()) await page.screenshot({ path: `${output}/failure.png`, timeout: 5000 }).catch(() => {});
  console.error(logs.slice(-2000));
  throw error;
} finally {
  await stopTestServer(server);
  await kv?.close();
  const result = {
    status: failure ? 'failed' : 'passed', startedAt, finishedAt: new Date().toISOString(), buildId,
    viewports: viewports.map(viewport => `${viewport.width}x${viewport.height}`), error: failure,
    checks: Object.fromEntries(['OPENING', 'LETTERS', 'CATS', 'VIEWER', 'ROOMS', 'PHOTO', 'AUDIO', 'AUDIO_ROUTES', 'AUDIO_MOBILE', 'FULL_FILM', 'RECOVERY', 'FILM', 'FALLBACK', 'MAP_WRITES'].map(key => [key, process.env[`QA_${key}`] === '1'])),
  };
  await writeFile(`${output}/result.json`, JSON.stringify({ ...result, cleanup: 'pending' }, null, 2));
  const deadline = setTimeout(() => {
    writeFileSync(`${output}/result.json`, JSON.stringify({ ...result, cleanup: 'timed-out' }, null, 2));
    console.error('Browser teardown did not finish; assertion results are in result.json.');
    process.exit(1);
  }, 35000);
  try {
    const chrome = browserServer?.process();
    if (chrome) {
      // A helper can retain a browser pipe after Chromium itself exits.
      const releasePipes = () => chrome.stdio.forEach(stream => stream?.destroy());
      if (chrome.exitCode !== null || chrome.signalCode !== null) releasePipes();
      else chrome.once('exit', releasePipes);
    }
    await browser?.close();
    await browserServer?.close();
    await writeFile(`${output}/result.json`, JSON.stringify({ ...result, cleanup: 'complete' }, null, 2));
  } finally {
    clearTimeout(deadline);
  }
}
