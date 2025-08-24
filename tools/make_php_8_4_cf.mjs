// Node ESM script to create scripts/php_8_4_cf.js from scripts/php_8_4.js
// It replaces the first occurrence of "var _scriptName = import.meta.url;" with a safe sentinel.
// Usage: node tools/make_php_8_4_cf.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const src = resolve(__dirname, '../scripts/php_8_4.js');
const dst = resolve(__dirname, '../scripts/php_8_4_cf.js');

const original = await readFile(src, 'utf8');

// Be tolerant to whitespace and optional semicolons
const patterns = [
  /var\s+_scriptName\s*=\s*import\.meta\.url\s*;/,
  /var\s+_scriptName\s*=\s*import\.meta\.url\s*/,
];

let replaced = original;
let hit = false;
for (const p of patterns) {
  if (p.test(replaced)) {
    replaced = replaced.replace(p, "var _scriptName = 'file:///'");
    hit = true;
    break;
  }
}

if (!hit) {
  throw new Error('Did not find "var _scriptName = import.meta.url" in scripts/php_8_4.js');
}

// Ensure we still export default Module (leave the rest of the file unchanged)
await writeFile(dst, replaced, 'utf8');
console.log('Wrote', dst);
