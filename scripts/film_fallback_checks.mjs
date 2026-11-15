import assert from 'node:assert/strict';

const catTexture = '**/assets/cats/nono-front.webp';

async function ensurePlayback(page, start) {
  const retry = page.getByRole('button', { name: '重试播放', exact: true });
  const advancing = () => page.waitForFunction(offset => {
    const audio = document.querySelector('audio');
    return audio?.getAttribute('src')?.includes('wo-shi-yi-zhi-yu') && !audio.paused && audio.currentTime > offset + .25;
  }, start, { timeout: 12000 });
  await Promise.race([advancing(), retry.waitFor({ timeout: 12000 })]);
  if (await retry.isVisible()) {
    await retry.click();
    await advancing();
  }
}

export async function checkFilmFallback(context, origin, output, width) {
  for (const fault of ['unavailable', 'texture', 'timeout', 'context-loss']) {
    const page = await context.newPage();
    const errors = [];
    const held = [];
    let intercepted = 0;
    page.on('pageerror', error => errors.push(error.message));
    const offset = fault === 'unavailable' ? 0 : 32;
    try {
      await page.addInitScript(({ offset, fault }) => {
        sessionStorage.setItem('archive.prelude.complete', 'true');
        sessionStorage.setItem('archive.film.requested', 'true');
        sessionStorage.setItem('archive.film.time', String(offset));
        if (fault === 'unavailable') {
          const getContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            return type === 'webgl2' || type === 'webgl' ? null : getContext.call(this, type, ...args);
          };
        }
      }, { offset, fault });
      if (fault === 'texture') await page.route(catTexture, route => { intercepted++; return route.abort('failed'); });
      if (fault === 'timeout') await page.route(catTexture, route => { intercepted++; held.push(route); });

      const started = Date.now();
      await page.goto(`${origin}/cinema`, { waitUntil: 'domcontentloaded' });
      let beforeLoss;
      if (fault === 'context-loss') {
        await page.locator('main[data-film-visual="live"]').waitFor({ timeout: 12000 });
        await ensurePlayback(page, offset);
        beforeLoss = await page.locator('audio').evaluate(audio => {
          audio.dataset.sourceLoads = '0';
          audio.addEventListener('loadstart', () => { audio.dataset.sourceLoads = String(Number(audio.dataset.sourceLoads) + 1); });
          return audio.currentTime;
        });
        const lost = await page.locator('canvas').evaluate(canvas => {
          const extension = canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context');
          if (!extension) return false;
          extension.loseContext();
          return true;
        });
        assert.ok(lost, 'lose the real WebGL context, not a synthetic DOM event');
      }
      await page.locator('main[data-film-visual="still"]').waitFor({ timeout: 15000 });
      if (fault === 'texture' || fault === 'timeout') assert.ok(intercepted > 0, 'the real cat texture was intercepted');
      if (fault === 'timeout') {
        assert.ok(Date.now() - started >= 7500, 'the pending texture waited for the visual deadline');
        for (const route of held.splice(0)) {
          await route.continue().catch(error => {
            if (!error.message.includes('Route is already handled')) throw error;
          });
        }
        await page.unroute(catTexture);
      }
      assert.equal(await page.locator('canvas').count(), 0);
      await ensurePlayback(page, offset);
      if (beforeLoss !== undefined) {
        await page.waitForFunction(time => document.querySelector('audio')?.currentTime > time + .5, beforeLoss);
        assert.equal(await page.locator('audio').getAttribute('data-source-loads'), '0', 'context loss does not reload the playing track');
      }
      const still = page.locator(`[data-film-still="${offset ? 'guangzhou' : 'night'}"][data-loaded="true"]`);
      await still.waitFor();
      assert.ok(await still.locator('img').evaluate(image => image.complete && image.naturalWidth > 0 && getComputedStyle(image).opacity === '1'));
      await page.waitForFunction(() => {
        const caption = document.querySelector('[data-film-caption] h2');
        return caption && getComputedStyle(caption).opacity === '1' && caption.getAttribute('aria-hidden') === 'false';
      }, null, { timeout: 9000 });
      assert.equal(await page.locator('main').getAttribute('data-chapter'), offset ? '1' : '0');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `${output}/fallback-${fault}-${width}.png` });
      if (fault === 'context-loss') {
        await page.locator('audio').evaluate(audio => { audio.currentTime = audio.duration - .8; });
        const ending = page.getByRole('link', { name: '去看看世界' });
        await ending.waitFor({ timeout: 12000 });
        assert.equal(await page.locator('main').getAttribute('data-playback'), 'completed');
        await ending.click();
        await page.waitForURL('**/world');
        assert.ok(await page.locator('audio').evaluate(audio => audio.paused));
      }
      // R3F reports caught render errors through window.reportError.
      assert.deepEqual(fault === 'texture' ? errors.filter(error => !error.startsWith('Could not load /assets/cats/nono-front.webp:')) : errors, []);
      console.log(`PASS film ${fault} ${width}px: still frame, timed captions, and running audio${fault === 'context-loss' ? ' without restart through map exit' : ''}`);
    } catch (error) {
      await page.screenshot({ path: `${output}/fallback-${fault}-${width}-failure.png`, timeout: 5000 }).catch(() => {});
      throw error;
    } finally {
      for (const route of held) await route.abort('failed').catch(() => {});
      await page.close();
    }
  }
}
