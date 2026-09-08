import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const compile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const archive = moduleUrl(compile(await readFile('src/data/archiveContent.ts', 'utf8')));
const compiled = compile(await readFile('src/data/storyWorld.ts', 'utf8')).replace('"@/data/archiveContent"', JSON.stringify(archive));
assert.ok(!compiled.includes('"@/data/archiveContent"'));
const { storyWorld } = await import(moduleUrl(compiled));
const timeline = storyWorld.timeline;
assert.equal(timeline[0].start, 0);
assert.ok(timeline.at(-1).start < 254.4);
assert.equal(new Set(timeline.map((beat) => beat.id)).size, timeline.length);
assert.deepEqual([...new Set(timeline.map((beat) => beat.chapterIndex))], [0, 1, 2, 3, 4, 5]);
for (let index = 1; index < timeline.length; index++) assert.ok(timeline[index].start > timeline[index - 1].start);
const copy = timeline.map((beat) => [beat.title, beat.body, beat.quote].filter(Boolean).join(' ')).join('\n');
assert.doesNotMatch(copy, /钱|归还|减重|回来证明|一笔带过|地点与日期留白|Hanni|晚安|小疯子/);
assert.equal(timeline.filter((beat) => beat.title.includes('心动')).length, 1);
assert.equal(timeline.filter((beat) => beat.title.includes('瑞士')).length, 1);
assert.equal(timeline[0].source, 'Eric 的感受');
assert.equal(timeline.find((beat) => beat.id === 'switzerland-to-guangzhou').source, '真实记录');
assert.equal(timeline.find((beat) => beat.id === 'ordinary-days').visual, 'night');
const scene = ts.createSourceFile('scene.tsx', await readFile('src/components/StoryWorldScene.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let projections;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(scene) === 'PROJECTION_VISUALS') {
    let value = node.initializer;
    while (ts.isAsExpression(value)) value = value.expression;
    assert.ok(ts.isArrayLiteralExpression(value));
    projections = value.elements.map((element) => element.text);
  }
  ts.forEachChild(node, visit);
}
visit(scene);
assert.ok(projections && !projections.includes('night'), 'unverified couple silhouette is not projected');
for (const beat of timeline) assert.ok(beat.visual === 'night' || projections.includes(beat.visual));
console.log(`PASS: ${timeline.length} ordered beats, all six chapters, no repeated opening or financial review, verified source categories and image selection`);
