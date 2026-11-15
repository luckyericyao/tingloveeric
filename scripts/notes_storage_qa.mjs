import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { startMockKv } from './fixtures/kv_mock.mjs';

const mock = await startMockKv();
const environmentKeys = ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
const previous = Object.fromEntries(environmentKeys.map(key => [key, process.env[key]]));
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
try {
  for (const key of environmentKeys) delete process.env[key];
  process.env.KV_REST_API_URL = mock.url;
  process.env.KV_REST_API_TOKEN = mock.token;
  const transport = moduleUrl(compile(await readFile('src/lib/kvRest.ts', 'utf8')));
  const source = compile(await readFile('src/lib/notesStore.ts', 'utf8')).replace('"@/lib/kvRest"', JSON.stringify(transport));
  assert.ok(!source.includes('"@/lib/kvRest"'));
  const { addNote, getNotes, isLoveNote, sanitizeNotes, notesPersistenceMode, NotesStorageUnavailable, NoteIdentityConflict } = await import(moduleUrl(source));
  const note = (id = randomUUID()) => ({ id, author: 'Eric', date: '2026-11-07', content: `Isolated letter ${id}`, source: 'eric-perspective', visibility: 'owner' });
  for (const value of [null, undefined, 0, false, 'invalid', [], {}]) assert.equal(isLoveNote(value), false);
  const legacy = Array.from({ length: 125 }, () => note());
  const legacyJson = JSON.stringify(legacy);
  mock.store.set('tingloveeric:notes', legacyJson);
  assert.equal(sanitizeNotes([...legacy, null, false]).length, 125, 'no silent 100-letter truncation');
  assert.equal((await getNotes()).length, 125);
  const additions = Array.from({ length: 24 }, () => note());
  await Promise.all(additions.map(addNote));
  assert.equal((await getNotes()).length, 149, 'all concurrent letters survive');
  assert.equal(mock.store.get('tingloveeric:notes'), legacyJson, 'legacy archive is never rewritten');
  assert.ok(!mock.commands.includes('SET'), 'letter reads/writes never replace an archive array');
  const retried = note();
  await Promise.all(Array.from({ length: 12 }, () => addNote(retried)));
  assert.equal((await getNotes()).filter(item => item.id === retried.id).length, 1, 'retry is idempotent');
  await assert.rejects(addNote({ ...retried, content: 'Changed content' }), NoteIdentityConflict);
  assert.equal((await getNotes()).find(item => item.id === retried.id).content, retried.content);
  mock.store.set('tingloveeric:notes', '{invalid');
  await assert.rejects(getNotes());
  assert.equal(mock.store.get('tingloveeric:notes'), '{invalid', 'corrupt archive is not silently reset');
  mock.store.set('tingloveeric:notes', legacyJson);
  for (const key of environmentKeys) delete process.env[key];
  assert.equal(notesPersistenceMode(), 'unavailable');
  await assert.rejects(getNotes(), NotesStorageUnavailable);
  await assert.rejects(addNote(note()), NotesStorageUnavailable);
  console.log('PASS: 125 legacy letters retained, 24 concurrent inserts, idempotent retries, conflict rejection, corruption preserved, unconfigured storage refuses writes');
  console.log('Scope: real application/HTTP transport with an isolated Redis-command fixture; no external Redis or production data used.');
} finally {
  for (const key of environmentKeys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
  await mock.close();
}
