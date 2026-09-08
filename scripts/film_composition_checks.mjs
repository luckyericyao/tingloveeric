import assert from 'node:assert/strict';

// Seek only for composition coverage. Real-time playback is checked separately.
export async function checkFilmComposition(context, origin, output, width) {
  const page = await context.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem('archive.prelude.complete', 'true');
    sessionStorage.setItem('archive.film.requested', 'true');
  });
  await page.goto(`${origin}/cinema`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^(暂停|继续)放映$/ }).waitFor({ timeout: 45000 });
  if (await page.getByRole('button', { name: '继续放映', exact: true }).isVisible()) {
    await page.getByRole('button', { name: '继续放映', exact: true }).click();
  }
  await page.getByRole('button', { name: '暂停放映', exact: true }).waitFor({ timeout: 45000 });
  for (const [chapter, time] of [4, 32, 52, 74, 102, 194].entries()) {
    await page.locator('audio').evaluate((audio, time) => { audio.currentTime = time; }, time);
    await page.waitForTimeout(2200);
    await page.getByRole('button', { name: '暂停放映', exact: true }).click();
    assert.equal(await page.locator('main').getAttribute('data-chapter'), String(chapter));
    await page.screenshot({ path: `${output}/film-${width}-chapter-${chapter}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByRole('button', { name: '继续放映', exact: true }).click();
  }
  await page.close();
  console.log(`Captured six film chapters at ${width}px for visual inspection`);
}
