import assert from 'node:assert/strict';

const mapApi = '**/api/world/places';

async function writeDraft(page, name, message) {
  await page.getByRole('button', { name: '写下一处想去的地方', exact: true }).click();
  await page.getByTestId('world-name').fill(name);
  await page.getByTestId('world-country').fill('仅本地验收');
  await page.getByTestId('world-message').fill(message);
  await page.getByTestId('world-lat').fill('31.2');
  await page.getByTestId('world-lng').fill('121.5');
}

async function readSavedMap(context, origin) {
  const response = await context.request.get(`${origin}/api/world/places`);
  assert.equal(response.status(), 200);
  return response.json();
}

export async function checkWorldWrites(browser, origin, ownerPasscode, output, viewport) {
  const owner = await browser.newContext({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
  const { width } = viewport;
  try {
    const auth = await owner.request.post(`${origin}/api/passcode`, { headers: { Origin: origin }, data: { passcode: ownerPasscode } });
    assert.equal(auth.status(), 200);
    const first = await owner.newPage();
    const second = await owner.newPage();
    const errors = [];
    let posts = 0;
    for (const page of [first, second]) {
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => {
        if (request.method() === 'POST' && request.url().endsWith('/api/world/places')) posts++;
      });
      await page.goto(`${origin}/world`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('world-sync').getByText('地图已读取。', { exact: true }).waitFor();
    }

    const names = [`隔离验收 A ${width}`, `隔离验收 B ${width}`];
    const secondText = '第二个标签的文字必须保留，不能盖掉先保存的地点。';
    await writeDraft(first, names[0], '第一个标签保存的地点。');
    await writeDraft(second, names[1], secondText);
    assert.equal(posts, 0, 'opening the page and typing do not save');
    await first.getByTestId('world-submit').click();
    await first.getByText('这次修改已经保存。', { exact: true }).waitFor();
    await second.getByTestId('world-submit').click();
    const editor = second.getByTestId('world-editor');
    const conflict = editor.getByRole('alert');
    await conflict.waitFor();
    assert.match(await conflict.innerText(), /地图已在别处更新/);
    assert.equal(await second.getByTestId('world-name').inputValue(), names[1]);
    assert.equal(await second.getByTestId('world-message').inputValue(), secondText);
    assert.ok(await second.getByTestId('world-submit').isDisabled());
    const afterFirst = await readSavedMap(owner, origin);
    assert.equal(afterFirst.customPlaces.filter(place => names.includes(place.name)).length, 1);
    assert.ok(afterFirst.customPlaces.some(place => place.name === names[0]));
    await editor.getByTestId('world-reload').scrollIntoViewIfNeeded();
    assert.ok(await second.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'conflict form stays within viewport');
    await second.screenshot({ path: `${output}/world-conflict-${width}.png` });
    await editor.getByTestId('world-reload').click();
    await second.getByTestId('world-sync').getByText('地图已读取。', { exact: true }).waitFor();
    assert.equal(await second.getByTestId('world-message').inputValue(), secondText);
    assert.equal(posts, 2, 'refreshing the map does not replay the draft');
    await second.getByTestId('world-submit').click();
    await second.getByText('这次修改已经保存。', { exact: true }).waitFor();
    const afterBoth = await readSavedMap(owner, origin);
    assert.equal(afterBoth.customPlaces.filter(place => names.includes(place.name)).length, 2);

    const retryName = `隔离验收 重试 ${width}`;
    const retryText = '即使服务端已保存但响应中断，也只能存一处。';
    await writeDraft(second, retryName, retryText);
    await second.route(mapApi, route => route.request().method() === 'POST'
      ? route.fulfill({ status: 200, json: { ...afterBoth, persistence: 'memory' } })
      : route.continue());
    await second.getByTestId('world-submit').click();
    await editor.getByRole('alert').waitFor();
    assert.equal(await second.getByTestId('world-message').inputValue(), retryText);
    assert.equal((await readSavedMap(owner, origin)).customPlaces.some(place => place.name === retryName), false);
    await second.unroute(mapApi);

    let dropped = false;
    await second.route(mapApi, async route => {
      if (!dropped && route.request().method() === 'POST') {
        const saved = await route.fetch();
        assert.equal(saved.status(), 200);
        dropped = true;
        await route.abort('failed');
      } else await route.continue();
    });
    await second.getByTestId('world-submit').click();
    await editor.getByRole('alert').waitFor();
    assert.ok(dropped);
    assert.equal(await second.getByTestId('world-message').inputValue(), retryText);
    await second.getByTestId('world-submit').click();
    await second.getByText('这次修改已经保存。', { exact: true }).waitFor();
    assert.equal((await readSavedMap(owner, origin)).customPlaces.filter(place => place.name === retryName).length, 1);
    assert.deepEqual(errors, []);
    console.log(`PASS map writes ${width}px: no automatic write, two-tab conflict, preserved draft, manual retry, lost-ack replay and no false save`);
  } finally {
    await owner.close();
  }
}
