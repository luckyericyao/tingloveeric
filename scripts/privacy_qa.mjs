import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const ownerSource = await readFile('src/data/ownerContent.ts', 'utf8');
assert.match(ownerSource, /import "server-only"/);
const ast = ts.createSourceFile('ownerContent.ts', ownerSource, ts.ScriptTarget.Latest, true);
const protectedText = [];
function visit(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'herFullName' && ts.isStringLiteral(node.initializer)) protectedText.push(node.initializer.text);
  ts.forEachChild(node, visit);
}
visit(ast);
assert.equal(protectedText.length, 1);
protectedText.push('这个改变由我完成，不需要她回来证明。', '过去我曾试图用金钱制造吸引。', '我不再试图购买一个结局。');
async function* files(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* files(filename);
    else if (/\.(?:js|map|json)$/.test(filename)) yield filename;
  }
}
let checked = 0;
for await (const filename of files('.next/static')) {
  const content = await readFile(filename, 'utf8');
  const literals = [];
  const source = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  function collect(node) {
    if (ts.isStringLiteralLike(node)) literals.push(node.text);
    ts.forEachChild(node, collect);
  }
  collect(source);
  for (const text of protectedText) {
    assert.ok(!content.includes(text) && !literals.some(literal => literal.includes(text)), `Owner-only text leaked into ${filename}`);
  }
  checked++;
}
assert.ok(checked > 0, 'build artifacts must exist before privacy validation');
console.log(`PASS: ${checked} production client artifacts contain no protected identity or owner-only reflection text`);
