import assert from 'node:assert/strict';
import { appendFile, writeFile } from 'node:fs/promises';

export async function checkAudioRoutes(page, origin, passcode) {
  const opening = '/audio/jiu-shi-ai-ni.m4a';
  const story = '/audio/wo-shi-yi-zhi-yu.m4a';
  const requested = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname.startsWith('/audio/')) requested.push(url.pathname);
  });

  await page.goto(`${origin}/world`, { waitUntil: 'networkidle' });
  assert.equal(new URL(page.url()).pathname, '/enter');
  assert.equal(new URL(page.url()).searchParams.get('next'), '/world');
  assert.equal(await page.locator('audio').getAttribute('src'), null);
  assert.deepEqual(requested, [], 'guest entry does not load a soundtrack');

  await page.getByLabel('小暗号').fill(passcode);
  await page.getByRole('button', { name: '打开小世界' }).click();
  await page.waitForURL(`${origin}/world`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('audio').getAttribute('src'), null);
  assert.deepEqual(requested, [], 'the requested room opens quietly after login');

  await page.getByRole('link', { name: '回到首页' }).click();
  await page.waitForURL(`${origin}/`);
  const hero = page.getByRole('heading', { name: '甜蜜的瞬间', exact: true });
  await hero.click();
  await page.waitForFunction(source => {
    const audio = document.querySelector('audio');
    return audio?.getAttribute('src') === source && audio.currentTime > .25 && !audio.paused;
  }, opening);
  assert.deepEqual([...new Set(requested)], [opening]);
  assert.equal(await page.getByRole('link', { name: '进入故事', exact: true }).count(), 0);

  // Simulate a saved position for a cold film refresh, not an opening bypass.
  await page.evaluate(() => {
    sessionStorage.setItem('archive.prelude.complete', 'true');
    sessionStorage.setItem('archive.film.requested', 'true');
    sessionStorage.setItem('archive.film.time', '32');
  });
  requested.length = 0;
  await page.goto(`${origin}/cinema`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(source => {
    const audio = document.querySelector('audio');
    return audio?.getAttribute('src') === source && audio.readyState >= 2 && audio.currentTime >= 32;
  }, story);
  assert.deepEqual([...new Set(requested)], [story], 'cold film resume never preloads the opening song');
  console.log(`PASS audio routes ${page.viewportSize().width}px: quiet login and map, opening through client navigation, story-only refresh`);
}

export async function checkAudioJourney(context, origin, output) {
  const page = await context.newPage();
  const journal = `${output}/natural-${page.viewportSize().width}.jsonl`;
  await writeFile(journal, '');
  const record = async event => appendFile(journal, `${JSON.stringify({ event, time: new Date().toISOString(), audioTime: await page.locator('audio').evaluate(audio => audio.currentTime) })}\n`);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: '甜蜜的瞬间', exact: true }).click();
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio');
    return audio && !audio.paused && audio.currentTime > 0;
  });
  assert.equal(await page.getByRole('link', { name: '进入故事', exact: true }).count(), 0);
  const openingSource = await page.locator('audio').getAttribute('src');
  await record('opening-started');
  await page.screenshot({ path: `${output}/audio-opening.png` });
  await page.waitForFunction(() => document.querySelector('audio').currentTime >= 55, null, { timeout: 70000 });
  assert.equal(await page.getByRole('link', { name: '进入故事', exact: true }).count(), 0);
  await page.getByRole('link', { name: '进入故事', exact: true }).waitFor({ timeout: 12000 });
  assert.ok(await page.locator('audio').evaluate(audio => audio.currentTime >= 60));
  await record('opening-entry-revealed');
  const openingVolume = await page.locator('audio').evaluate(audio => audio.volume);
  // Capture short transitions in the page, not between automation round trips.
  await page.evaluate(() => {
    const audio = document.querySelector('audio');
    const frames = [];
    window.storyHandoffFrames = frames;
    const deadline = performance.now() + 45000;
    const sample = () => {
      const phase = audio.dataset.audioTransition;
      if (phase === 'fading-out' || phase === 'fading-in') {
        const main = document.querySelector('main');
        frames.push({
          phase,
          path: location.pathname,
          volume: audio.volume,
          entering: main?.dataset.entering,
          veil: main ? Number(getComputedStyle(main, '::after').opacity) : 0,
        });
      }
      if (performance.now() < deadline && !(location.pathname === '/cinema' &&
          phase === 'steady' && !audio.paused && audio.currentTime > 1)) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.getByRole('link', { name: '进入故事', exact: true }).click();
  await page.waitForURL('**/cinema');
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio');
    return audio?.getAttribute('src')?.includes('wo-shi-yi-zhi-yu') &&
      !audio.paused && audio.currentTime > .25 && audio.dataset.audioTransition === 'steady';
  }, null, { timeout: 45000 });
  const handoff = await page.evaluate(() => window.storyHandoffFrames);
  await writeFile(`${output}/handoff-${page.viewportSize().width}.json`, JSON.stringify(handoff));
  assert.ok(handoff.some(frame => frame.phase === 'fading-out' && frame.path === '/' &&
    frame.entering === 'true' && frame.volume > 0 && frame.volume < openingVolume),
  'opening song fades before navigation');
  assert.ok(handoff.some(frame => frame.phase === 'fading-out' && frame.path === '/' && frame.veil > .1),
    'picture dims with audio handoff');
  assert.ok(handoff.some(frame => frame.phase === 'fading-in' && frame.path === '/cinema' && frame.volume < .26),
    'story song begins below its settled volume');
  assert.ok(Math.abs(await page.locator('audio').evaluate(audio => audio.volume) - .26) < .01, 'story song settles at intended volume');
  await page.getByRole('button', { name: '暂停放映', exact: true }).waitFor({ timeout: 45000 });
  assert.notEqual(await page.locator('audio').getAttribute('src'), openingSource);
  await record('story-started');
  await page.waitForFunction(() => document.querySelector('audio').currentTime > 3);
  await page.getByRole('button', { name: '暂停放映', exact: true }).click();
  const pausedAt = await page.locator('audio').evaluate(audio => audio.currentTime);
  await page.waitForTimeout(1500);
  assert.ok(await page.locator('audio').evaluate(audio => audio.paused));
  assert.ok(Math.abs(await page.locator('audio').evaluate(audio => audio.currentTime) - pausedAt) < .1);
  assert.equal(await page.locator('main').getAttribute('data-paused'), 'true');
  await page.screenshot({ path: `${output}/audio-film-paused.png` });
  await page.getByRole('button', { name: '继续放映', exact: true }).click();
  await page.waitForFunction(time => document.querySelector('audio').currentTime > time + 1, pausedAt);
  const beforeRefresh = await page.locator('audio').evaluate(audio => audio.currentTime);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '暂停放映', exact: true }).waitFor({ timeout: 45000 });
  assert.ok(await page.locator('audio').evaluate(audio => audio.currentTime) >= beforeRefresh - 1);
  await page.getByRole('button', { name: '静音', exact: true }).click();
  assert.ok(await page.locator('audio').evaluate(audio => audio.muted));
  if (process.env.QA_FULL_FILM === '1') {
    const chapters = new Set();
    for (let sample = 0; sample < 110; sample++) {
      const chapter = await page.locator('main').getAttribute('data-chapter');
      if (!chapters.has(chapter)) {
        chapters.add(chapter);
        console.log(`Natural film reached chapter ${chapter}`);
        await record(`chapter-${chapter}`);
      }
      if (await page.getByRole('link', { name: '去看看世界' }).isVisible()) break;
      await page.waitForTimeout(3000);
    }
    if (chapters.size !== 6) {
      console.log('Incomplete film diagnostics', await page.locator('audio').evaluate(audio => ({
        time: audio.currentTime, duration: audio.duration, paused: audio.paused,
        ended: audio.ended, readyState: audio.readyState, error: audio.error?.code,
        visibility: document.visibilityState,
      })));
      await page.screenshot({ path: `${output}/audio-incomplete.png` });
    }
    assert.equal(chapters.size, 6, 'all six chapters played naturally');
    await record('film-completed');
    await page.getByRole('link', { name: '去看看世界' }).click({ timeout: 5000 });
    await page.waitForURL('**/world');
    assert.ok(await page.locator('audio').evaluate(audio => audio.paused), 'film audio stops in map');
    await record('map-opened-audio-stopped');
    console.log('PASS full natural film: six chapters, no object clicks or seeking, map exit available');
  }
  assert.deepEqual(errors, []);
  console.log('PASS real-time opening: hidden at 55s, revealed at 60s; direct movie handoff, pause, resume, refresh and mute');
  await page.close();
}
