import assert from 'node:assert/strict';

export async function checkAudioJourney(context, origin, output) {
  const page = await context.newPage();
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
  await page.screenshot({ path: `${output}/audio-opening.png` });
  await page.waitForFunction(() => document.querySelector('audio').currentTime >= 55, null, { timeout: 70000 });
  assert.equal(await page.getByRole('link', { name: '进入故事', exact: true }).count(), 0);
  await page.getByRole('link', { name: '进入故事', exact: true }).waitFor({ timeout: 12000 });
  assert.ok(await page.locator('audio').evaluate(audio => audio.currentTime >= 60));
  await page.getByRole('link', { name: '进入故事', exact: true }).click();
  await page.waitForURL('**/cinema');
  await page.getByRole('button', { name: '暂停放映', exact: true }).waitFor({ timeout: 45000 });
  assert.notEqual(await page.locator('audio').getAttribute('src'), openingSource);
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
  assert.deepEqual(errors, []);
  console.log('PASS real-time opening: hidden at 55s, revealed at 60s; direct movie handoff, pause, resume, refresh and mute');
  await page.close();
}
