import assert from 'node:assert/strict';

export async function checkManualAudioResume(context, origin) {
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      sessionStorage.setItem('archive.prelude.complete', 'true');
      sessionStorage.setItem('archive.film.requested', 'true');
      sessionStorage.setItem('archive.film.time', '32');
      localStorage.removeItem('tingloveeric.muted');
      const play = HTMLMediaElement.prototype.play;
      let rejected = false;
      HTMLMediaElement.prototype.play = function () {
        if (!rejected && this.src.includes('wo-shi-yi-zhi-yu')) {
          rejected = true;
          return Promise.reject(new DOMException('Isolated autoplay policy check', 'NotAllowedError'));
        }
        return play.call(this);
      };
    });
    await page.goto(`${origin}/cinema`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '重试播放', exact: true }).waitFor({ timeout: 20000 });
    const resume = page.getByRole('button', { name: '继续放映', exact: true });
    const audio = page.locator('audio');
    await audio.evaluate(el => {
      el.dataset.resumeLoads = '0';
      el.addEventListener('loadstart', () => { el.dataset.resumeLoads = String(Number(el.dataset.resumeLoads) + 1); });
    });
    await resume.click();
    await page.waitForFunction(() => {
      const el = document.querySelector('audio');
      return el && !el.paused && el.currentTime > 32.5 && !el.muted && Math.abs(el.volume - .26) < .01;
    });
    assert.equal(await audio.getAttribute('data-resume-loads'), '0');
    await page.getByRole('button', { name: '静音', exact: true }).click();
    await page.getByRole('button', { name: '暂停放映', exact: true }).click();
    const pausedAt = await audio.evaluate(el => el.currentTime);
    await resume.click();
    await page.waitForFunction(time => {
      const el = document.querySelector('audio');
      return el && !el.paused && el.currentTime > time + .5;
    }, pausedAt);
    assert.ok(await audio.evaluate(el => el.muted && el.volume === 0), 'manual continuation respects intentional mute');
    await page.getByRole('button', { name: '取消静音', exact: true }).click();
    assert.ok(await audio.evaluate(el => !el.muted && Math.abs(el.volume - .26) < .01));
    console.log(`PASS manual continuation ${page.viewportSize().width}px: audible after blocked autoplay, original position, mute respected`);
  } finally {
    await page.close();
  }
}

export async function checkOpeningAudioRecovery(context, origin, output) {
  const page = await context.newPage();
  const openingAudio = '**/audio/jiu-shi-ai-ni.m4a';
  try {
    await page.route(openingAudio, route => route.abort('failed'));
    await page.goto(origin, { waitUntil: 'networkidle' });
    const play = page.getByRole('button', { name: '播放《就是爱你》', exact: true });
    const mediaFailed = () => Boolean(document.querySelector('audio')?.error);
    if (!(await page.evaluate(mediaFailed))) await play.click();
    await page.waitForFunction(mediaFailed, null, { timeout: 10000 });
    await page.getByText('音乐暂不可用', { exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: '进入故事', exact: true }).count(), 0);
    await page.screenshot({ path: `${output}/opening-audio-retry-${page.viewportSize().width}.png` });
    await page.unroute(openingAudio);
    await page.getByRole('button', { name: '重试《就是爱你》', exact: true }).click();
    await page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && !audio.paused && audio.currentTime > .2 && audio.readyState >= 2;
    }, null, { timeout: 12000 });
    await page.getByText('正在播放', { exact: true }).waitFor({ state: 'attached' });
    assert.equal(await page.getByRole('link', { name: '进入故事', exact: true }).count(), 0);
    console.log(`PASS opening audio ${page.viewportSize().width}px: a failed media load can be retried without bypassing the gate`);
  } catch (error) {
    await page.screenshot({ path: `${output}/opening-audio-failure-${page.viewportSize().width}.png`, timeout: 5000 }).catch(() => {});
    throw error;
  } finally {
    await page.close();
  }
}

export async function checkAudioRecovery(context, origin, output = '.audit/current-map') {
  const page = await context.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem('archive.prelude.complete', 'true');
    sessionStorage.setItem('archive.film.requested', 'true');
    sessionStorage.setItem('archive.film.time', '32');
  });
  const pattern = /\.(mp3|wav|m4a)(\?.*)?$/;
  await page.route(pattern, route => route.abort('failed'));
  await page.goto(`${origin}/cinema`, { waitUntil: 'domcontentloaded' });
  const retry = page.getByRole('button', { name: '重试播放', exact: true });
  await retry.waitFor({ timeout: 45000 });
  assert.equal(await page.locator('main').getAttribute('data-paused'), 'true');
  await page.unroute(pattern);
  await retry.click();
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio');
    return audio && !audio.paused && audio.currentTime >= 32 && audio.readyState >= 2;
  }, null, { timeout: 30000 });
  await retry.waitFor({ state: 'hidden' });
  assert.equal(await page.locator('main').getAttribute('data-chapter'), '1');
  await page.getByRole('button', { name: '暂停放映', exact: true }).click();
  await page.waitForTimeout(300);
  const canvas = page.locator('canvas').first();
  const pausedFrame = await canvas.screenshot();
  const caption = page.locator('[data-film-caption]');
  const captionTimes = await caption.evaluate(el => el.getAnimations({ subtree: true }).map(animation => animation.currentTime));
  assert.ok(captionTimes.length >= 2, 'title and body have independent film timing');
  await page.waitForTimeout(1200);
  assert.ok(pausedFrame.equals(await canvas.screenshot()), 'paused canvas pixels remain identical');
  assert.deepEqual(await caption.evaluate(el => el.getAnimations({ subtree: true }).map(animation => animation.currentTime)), captionTimes, 'paused subtitles remain frozen');
  await page.getByRole('button', { name: '继续放映', exact: true }).click();
  await page.waitForTimeout(4500);
  assert.equal(await caption.locator('h2').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.equal(await caption.locator('p').first().evaluate(el => getComputedStyle(el).opacity), '1');
  await page.screenshot({ path: `${output}/caption-${page.viewportSize().width}.png` });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await caption.evaluate(el => el.getAnimations({ subtree: true }).length), 0, 'reduced motion reveals captions without animation');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('audio').evaluate(audio => { audio.currentTime = audio.duration - 6; });
  const ending = page.getByRole('link', { name: '去看看世界' });
  await ending.waitFor({ timeout: 20000 });
  assert.equal(await page.locator('main').getAttribute('data-playback'), 'completed');
  assert.equal(await ending.evaluate(el => getComputedStyle(el).opacity), '1', 'ending link is not trapped in paused entrance animation');
  assert.equal(await ending.evaluate(el => el.getAnimations().length), 0);
  await page.screenshot({ path: `${output}/ending-${page.viewportSize().width}.png` });
  await ending.click();
  await page.waitForURL('**/world');
  assert.ok(await page.locator('audio').evaluate(audio => audio.paused));
  await page.close();
  console.log('PASS recovery and ending: retry, paused canvas/subtitles, reduced motion, visible map exit after actual ended event');

  const stalled = await context.newPage();
  const held = [];
  const storyAudio = '**/audio/wo-shi-yi-zhi-yu.m4a';
  try {
    await stalled.addInitScript(() => {
      sessionStorage.setItem('archive.prelude.complete', 'true');
      sessionStorage.setItem('archive.film.requested', 'true');
      sessionStorage.setItem('archive.film.time', '32');
    });
    await stalled.route(storyAudio, route => route.abort('failed'));
    await stalled.goto(`${origin}/cinema`, { waitUntil: 'domcontentloaded' });
    const stalledRetry = stalled.getByRole('button', { name: '重试播放', exact: true });
    await stalledRetry.waitFor({ timeout: 45000 });
    await stalled.waitForFunction(() => document.querySelector('audio')?.error !== null);
    await stalled.unroute(storyAudio);
    await stalled.route(storyAudio, route => { held.push(route); });
    const bufferingSince = Date.now();
    await stalledRetry.click();
    await stalled.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && !audio.paused && audio.readyState < 2;
    });
    await stalledRetry.waitFor({ state: 'hidden' });
    assert.ok(held.length > 0, 'a real audio request remains pending');
    const stalledAt = await stalled.locator('audio').evaluate(audio => audio.currentTime);
    await stalledRetry.waitFor({ timeout: 22000 });
    assert.ok(Date.now() - bufferingSince >= 14000, 'watchdog waits for a stalled request rather than handling an immediate play rejection');
    assert.ok(await stalled.locator('audio').evaluate(audio => audio.paused), 'buffer watchdog pauses pending playback');
    assert.equal(await stalled.locator('main').getAttribute('data-paused'), 'true');
    assert.equal(await stalled.locator('audio').evaluate(audio => audio.currentTime), stalledAt, 'stalled film does not advance');
    await stalled.unroute(storyAudio);
    for (const route of held) await route.abort('failed').catch(() => {});
    await stalledRetry.click();
    await stalled.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && !audio.paused && audio.currentTime >= 32 && audio.readyState >= 2;
    });
    await stalledRetry.waitFor({ state: 'hidden' });
    assert.equal(await stalled.locator('main').getAttribute('data-chapter'), '1');
    await stalled.screenshot({ path: `${output}/stalled-recovered-${stalled.viewportSize().width}.png` });
    console.log(`PASS stalled audio ${stalled.viewportSize().width}px: pending network request times out, frozen story, retry resumes at 32 seconds`);
  } finally {
    for (const route of held) await route.abort('failed').catch(() => {});
    await stalled.close();
  }
}
