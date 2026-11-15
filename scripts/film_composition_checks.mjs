import assert from 'node:assert/strict';

async function sampleCanvas(page) {
  const capture = await page.locator('canvas').first().screenshot();
  return page.evaluate(async source => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const sample = document.createElement('canvas');
    sample.width = 64;
    sample.height = 40;
    const context = sample.getContext('2d');
    context.drawImage(image, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    const colors = new Set();
    for (let i = 0; i < pixels.length; i += 4) {
      colors.add((pixels[i] >> 4) * 256 + (pixels[i + 1] >> 4) * 16 + (pixels[i + 2] >> 4));
    }
    return { colors: colors.size, pixels: Array.from(pixels) };
  }, `data:image/png;base64,${capture.toString('base64')}`);
}

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
  let previousPixels;
  for (const [chapter, time] of [4, 32, 52, 74, 102, 194].entries()) {
    await page.locator('audio').evaluate((audio, time) => { audio.currentTime = time; }, time);
    await page.waitForTimeout(2200);
    await page.getByRole('button', { name: '暂停放映', exact: true }).click();
    assert.equal(await page.locator('main').getAttribute('data-chapter'), String(chapter));
    const frame = await sampleCanvas(page);
    assert.ok(frame.colors > 16, `chapter ${chapter} at ${width}px has visible canvas detail (${frame.colors} colors)`);
    if (previousPixels) {
      const difference = frame.pixels.reduce((sum, value, index) => sum + Math.abs(value - previousPixels[index]), 0);
      assert.ok(difference / frame.pixels.length > 1, `chapter ${chapter} at ${width}px renders a different composition`);
    }
    previousPixels = frame.pixels;
    await page.screenshot({ path: `${output}/film-${width}-chapter-${chapter}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByRole('button', { name: '继续放映', exact: true }).click();
  }
  await page.waitForFunction(() => [...document.querySelectorAll('[data-film-caption] h2, [data-film-caption] p')]
    .every(line => line.getAttribute('aria-hidden') === 'false'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('audio').evaluate(audio => { audio.currentTime = 126; });
  await page.waitForFunction(() => document.querySelector('main')?.dataset.beat === '5');
  assert.ok(await page.locator('[data-film-caption] [aria-hidden="true"]').count() === 0,
    'reduced-motion captions are accessible without animation events');
  await page.close();
  console.log(`PASS six film chapters at ${width}px: nonblank, distinct canvas pixels and screenshots`);
}
