// Merge Haiku-extracted chunk JSON files into src/data/words.json.
// Usage: node scripts/merge-words.mjs <dir-with-chunk-N.json>
// Alphabetical chunks (1..n) come first, the word-group chunk (0) last; duplicates keep the first.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('usage: node scripts/merge-words.mjs <dir>');

const files = readdirSync(dir)
  .filter((f) => /^chunk-\d+\.json$/.test(f))
  .sort((a, b) => {
    const n = (f) => Number(f.match(/\d+/)[0]) || Infinity;
    return n(a) - n(b);
  });

const slug = (s) =>
  s.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ARTICLES = new Set(['der', 'die', 'das', null]);
const seen = new Set();
const words = [];
const problems = [];

for (const f of files) {
  for (const e of JSON.parse(readFileSync(join(dir, f), 'utf8'))) {
    const w = {
      de: e.de?.trim(),
      article: e.article ?? null,
      plural: e.plural?.trim() || null,
      meaning: e.meaning?.trim(),
      example_de: e.example_de?.trim(),
      example_en: e.example_en?.trim(),
    };
    for (const k of ['de', 'meaning', 'example_de', 'example_en']) {
      if (!w[k]) problems.push(`${f}: ${w.de ?? '?'} missing ${k}`);
    }
    if (!ARTICLES.has(w.article)) problems.push(`${f}: ${w.de} bad article ${w.article}`);
    if (!w.de) continue;
    let id = slug(`${w.article ?? ''} ${w.de}`);
    if (seen.has(id)) continue;
    seen.add(id);
    words.push({ id, ...w });
  }
}

writeFileSync('src/data/words.json', JSON.stringify(words, null, 1) + '\n');
console.log(`${words.length} words from ${files.length} files`);
if (problems.length) console.log(problems.join('\n'));
