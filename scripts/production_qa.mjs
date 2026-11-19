import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const site = 'https://tingloveeric.vercel.app';
const repository = 'https://api.github.com/repos/luckyericyao/tingloveeric';

async function read(url, consume) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(12000),
        headers: { 'User-Agent': 'tingloveeric-production-qa', Connection: 'close' },
      });
      if (attempt < 2 && [502, 503, 504].includes(response.status)) {
        await response.body?.cancel();
        await delay(500 * (attempt + 1));
        continue;
      }
      // Await body reads here so a dropped connection during download is retried too.
      return await consume(response);
    } catch (error) {
      if (attempt >= 2 || !['TypeError', 'TimeoutError'].includes(error.name)) throw error;
      await delay(500 * (attempt + 1));
    }
  }
}

function github(path) {
  return read(repository + path, response => {
    assert.equal(response.status, 200, `GitHub request failed: ${path}`);
    return response.json();
  });
}

async function verify(sha) {
  assert.match(sha ?? '', /^[a-f0-9]{40}$/, 'Provide the full deployed commit SHA');
  const branch = await github('/branches/main');
  assert.equal(branch.commit?.sha, sha, 'GitHub main does not match the requested SHA');
  const deployments = await github('/deployments?environment=Production&per_page=1');
  const [production] = deployments;
  assert.equal(production?.sha, sha, 'Latest Vercel Production deployment is not this SHA');
  const [status] = await github(`/deployments/${production.id}/statuses?per_page=1`);
  assert.equal(status?.state, 'success', 'Vercel Production did not report success');

  const checks = [];
  for (const path of ['/', '/cinema', '/coordinates', '/notes', '/private', '/world', '/him']) {
    await read(site + path, async response => {
      await response.body?.cancel();
      assert.equal(response.status, 307, path);
      const next = new URL(response.headers.get('location') || '', site);
      assert.equal(next.origin, site, path);
      assert.equal(next.pathname, '/enter', path);
      assert.equal(next.searchParams.get('next'), path, path);
    });
    checks.push({ path, status: 307, result: 'passcode redirect retains path' });
  }
  await read(site + '/enter', async response => {
    assert.equal(response.status, 200, '/enter');
    const markup = await response.text();
    assert.match(markup, /进入档案馆|正在打开小世界/);
    assert.doesNotMatch(markup, /<audio\b[^>]*\bsrc=/i, 'the passcode page must not preload a soundtrack');
  });
  checks.push({ path: '/enter', status: 200, result: 'passcode page, no soundtrack preload' });

  for (const path of ['/api/notes', '/api/world/places', '/images/home/hero-memory-collage.jpg',
    '/audio/jiu-shi-ai-ni.m4a', '/audio/wo-shi-yi-zhi-yu.m4a']) {
    await read(site + path, async response => {
      await response.body?.cancel();
      assert.equal(response.status, 401, path);
      assert.match(response.headers.get('cache-control') || '', /\bno-store\b/, path);
    });
    checks.push({ path, status: 401, result: 'private, not cacheable' });
  }

  const evidence = { checkedAt: new Date().toISOString(), sha, site,
    deploymentId: production.id, deploymentStatus: status.state, checks };
  const output = `.audit/production/${sha}.json`;
  await mkdir('.audit/production', { recursive: true });
  await writeFile(output, JSON.stringify(evidence, null, 2) + '\n');
  console.log(`PASS ${sha}: ${site}, Vercel Production ${production.id}, ${checks.length} public-route checks`);
  console.log(`Saved ${output}. Authenticated flows and writes were not tested.`);
}

await verify(process.argv[2]).catch(error => {
  // Assertions only describe public metadata, never response bodies from private routes.
  console.error(`Production QA failed: ${error.message}`);
  process.exitCode = 1;
});
