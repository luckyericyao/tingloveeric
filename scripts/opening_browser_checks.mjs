import assert from 'node:assert/strict';

export async function checkOpening(context, origin, output, width) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    const region = page.getByRole('region', { name: '首页的三段甜蜜记录' });
    assert.equal(await region.count(), 0, 'locked timeline is not exposed to assistive technology');
    assert.equal(await page.getByRole('link', { name: '进入电影故事', exact: true }).count(), 0);
    assert.equal(await page.getByRole('link', { name: '私人房间', exact: true }).count(), 0);
    assert.equal(await page.locator('[data-opening-frame]').count(), 12);
    const pause = page.getByRole('button', { name: '暂停《就是爱你》', exact: true });
    if (await pause.isVisible()) await pause.click();
    await page.getByRole('button', { name: '播放《就是爱你》', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('audio').paused && document.querySelector('audio').currentTime > 0, null, { timeout: 10000 });
    await page.getByRole('button', { name: '暂停《就是爱你》', exact: true }).click();
    for (let index = 0; index < 12; index++) {
      await page.locator('audio').evaluate((audio, time) => {
        audio.currentTime = time;
        audio.dispatchEvent(new Event('timeupdate'));
      }, index * 5 + .2);
      await page.waitForFunction(index => document.querySelector('[data-prelude-slide]')?.dataset.preludeSlide === String(index), index);
      const frame = page.locator('[data-opening-frame][aria-hidden="false"]');
      await frame.waitFor({ state: 'visible' });
      await page.waitForFunction(() => {
        const active = document.querySelector('[data-opening-frame][aria-hidden="false"]');
        return active && Number(getComputedStyle(active).opacity) >= .99;
      });
      for (const image of await frame.locator('img').all()) await image.evaluate(image => image.decode());
      const labelFits = await frame.locator('figcaption strong').evaluate(element => {
        const style = getComputedStyle(element);
        return element.clientHeight <= Number.parseFloat(style.lineHeight) * 2.1 && element.scrollWidth <= element.clientWidth + 1;
      });
      assert.ok(labelFits, `frame ${index} has a readable horizontal label`);
      const bounds = await frame.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `frame ${index} stays inside viewport`);
      assert.equal(await page.getByRole('link', { name: '进入故事', exact: true }).count(), 0);
      if ([0, 5, 8, 10, 11].includes(index)) await page.screenshot({ path: `${output}/opening-${width}-${index}.png` });
    }
    const pausedFrame = await page.locator('[data-prelude-slide]').getAttribute('data-prelude-slide');
    assert.ok(await page.locator('audio').evaluate(audio => audio.paused), 'manual pause survives later media readiness events');
    const pausedTime = await page.locator('audio').evaluate(audio => audio.currentTime);
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('[data-prelude-slide]').getAttribute('data-prelude-slide'), pausedFrame);
    assert.equal(await page.locator('audio').evaluate(audio => audio.currentTime), pausedTime);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('[inert]'))), false);
    await page.mouse.wheel(0, 700);
    assert.equal(await page.evaluate(() => scrollY), 0, 'opening remains scroll-locked');
    await page.locator('audio').evaluate(audio => { audio.currentTime = 60.1; audio.dispatchEvent(new Event('timeupdate')); });
    await page.getByRole('link', { name: '进入故事', exact: true }).waitFor();
    assert.equal(await region.count(), 1, 'timeline becomes accessible after a minute');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const transition = await page.locator('[data-opening-frame][aria-hidden="false"]').evaluate(element => getComputedStyle(element).transitionDuration);
    assert.ok(Number.parseFloat(transition) <= .001, 'reduced motion removes perceptible transitions');
    assert.deepEqual(errors, []);
    console.log(`PASS opening ${width}px: all 12 frames, labels fit, no early entry/focus/scroll, pause and reduced motion. This visual test seeks; natural timing is checked separately.`);
  } catch (error) {
    await page.screenshot({ path: `${output}/opening-${width}-failure.png` }).catch(() => {});
    throw error;
  } finally {
    await page.close();
  }
}
