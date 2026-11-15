import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const archiveUrl = moduleUrl(compile(await readFile('src/data/archiveContent.ts', 'utf8')));
const { openingPrints, openingBeatAt, OPENING_DURATION, OPENING_BEAT_SECONDS } = await import(moduleUrl(
  compile(await readFile('src/data/openingSequence.ts', 'utf8')).replace('"@/data/archiveContent"', JSON.stringify(archiveUrl)),
));
assert.equal(openingPrints.length, 12);
assert.equal(new Set(openingPrints.map(print => print.id)).size, 12);
assert.equal(OPENING_DURATION, 60);
assert.equal(OPENING_BEAT_SECONDS, 5);
for (let beat = 0; beat < 12; beat++) {
  assert.equal(openingBeatAt(beat * 5), beat);
  assert.equal(openingBeatAt(beat * 5 + 4.99), beat);
}
for (const time of [-5, NaN, Infinity]) assert.equal(openingBeatAt(time), 0);
assert.equal(openingBeatAt(60), 11);
assert.equal(openingBeatAt(300), 11);
for (const print of openingPrints.filter(print => print.kind === 'photo')) await readFile(`public${print.source}`);
const { archiveContent } = await import(archiveUrl);
assert.deepEqual(openingPrints.filter(print => print.kind === 'quote').map(print => print.quote), [...archiveContent.tenderMoments.replies]);
console.log('PASS: twelve unique five-second frames, all 60 seconds covered, existing assets and genuine replies only');
