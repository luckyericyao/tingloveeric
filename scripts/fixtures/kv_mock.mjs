import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

// A loopback-only Redis REST contract fixture; never a production storage fallback.
export async function startMockKv({ beforeCommand } = {}) {
  const store = new Map();
  const token = randomBytes(24).toString('hex');
  const commands = [];
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    if (request.headers.authorization !== `Bearer ${token}`) {
      response.writeHead(401).end(JSON.stringify({ error: 'Unauthorized test request' }));
      return;
    }
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 1024 * 1024) throw new Error('Test payload too large');
        chunks.push(chunk);
      }
      const command = JSON.parse(Buffer.concat(chunks).toString());
      if (!Array.isArray(command)) throw new Error('Expected command array');
      const [operation, key, field, value] = command;
      commands.push(operation);
      if (beforeCommand) await beforeCommand(command);
      let result;
      if (operation === 'GET') result = store.get(key) ?? null;
      else if (operation === 'SET') { store.set(key, field); result = 'OK'; }
      else if (operation === 'EVAL') {
        const [, script, keyCount, mapKey, mode, expected, encoded] = command;
        if (keyCount !== 1 || mapKey !== 'tingloveeric:world-map' || !script.includes("redis.call('SET', KEYS[1], ARGV[3])") ||
            !['missing', 'present'].includes(mode) || typeof expected !== 'string' || typeof encoded !== 'string') {
          throw new Error('Unexpected map compare-and-save contract');
        }
        const current = store.get(mapKey);
        if (current === encoded) result = 1;
        else if ((mode === 'missing' && current === undefined) || (mode === 'present' && current === expected)) {
          store.set(mapKey, encoded);
          result = 1;
        } else result = 0;
      }
      else if (['HSETNX', 'HGET', 'HGETALL'].includes(operation)) {
        const current = store.get(key);
        if (current !== undefined && !(current instanceof Map)) throw new Error('WRONGTYPE');
        const hash = current ?? new Map();
        if (operation === 'HSETNX') {
          result = hash.has(field) ? 0 : 1;
          if (result) { hash.set(field, value); store.set(key, hash); }
        } else if (operation === 'HGET') result = hash.get(field) ?? null;
        else result = [...hash.entries()].flat();
      } else throw new Error(`Unsupported test command: ${operation}`);
      if (result instanceof Map) throw new Error('WRONGTYPE');
      response.end(JSON.stringify({ result }));
    } catch (error) {
      response.end(JSON.stringify({ error: error.message }));
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    token,
    store,
    commands,
    close: () => new Promise((resolve, reject) => {
      server.closeAllConnections();
      server.close(error => error ? reject(error) : resolve());
    }),
  };
}

export async function stopTestServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise(resolve => {
    const deadline = setTimeout(() => child.kill('SIGKILL'), 5000);
    child.once('exit', () => { clearTimeout(deadline); resolve(); });
    child.kill('SIGTERM');
  });
}
