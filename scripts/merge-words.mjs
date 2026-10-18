// Build src/data/words.json from the Haiku-extracted chunks in data/raw/.
// Usage: node scripts/merge-words.mjs [raw-dir]
// Alphabetical chunks (1..n) come first, the word-group chunk (0) last; duplicates keep the first.
// data/overrides.json: per-word corrections keyed by `de` (null drops the word).
// data/plurals-added.json: plurals the Goethe list omits, keyed by `de`; flagged with plural_added.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'data/raw';
const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);
const overrides = readJson('data/overrides.json', {});
const pluralsAdded = readJson('data/plurals-added.json', {});

const files = readdirSync(dir)
  .filter((f) => /^chunk-\d+\.json$/.test(f))
  .sort((a, b) => {
    const n = (f) => Number(f.match(/\d+/)[0]) || Infinity;
    return n(a) - n(b);
  });

// Id comes from the word only (case kept, so "essen" and "Essen" differ); fixing an article keeps saved progress.
const slug = (s) =>
  s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ARTICLES = new Set(['der', 'die', 'das', null]);
const seen = new Set();
const words = [];
const problems = [];

for (const f of files) {
  for (const e of JSON.parse(readFileSync(join(dir, f), 'utf8'))) {
    const de = e.de?.trim();
    if (!de) {
      problems.push(`${f}: entry without de`);
      continue;
    }
    if (overrides[de] === null) continue;
    const w = {
      de,
      article: e.article ?? null,
      plural: e.plural?.trim() || null,
      meaning: e.meaning?.trim(),
      example_de: e.example_de?.trim(),
      example_en: e.example_en?.trim(),
      ...overrides[de],
    };
    if (!w.plural && w.article && pluralsAdded[de]) {
      w.plural = pluralsAdded[de];
      w.plural_added = true;
    }
    for (const k of ['meaning', 'example_de', 'example_en']) {
      if (!w[k]) problems.push(`${f}: ${de} missing ${k}`);
    }
    if (!ARTICLES.has(w.article)) problems.push(`${f}: ${de} bad article ${w.article}`);
    const id = slug(de);
    if (seen.has(id)) continue;
    seen.add(id);
    words.push({ id, ...w });
  }
}

writeFileSync('src/data/words.json', JSON.stringify(words, null, 1) + '\n');
console.log(`${words.length} words from ${files.length} files`);
if (problems.length) console.log(problems.join('\n'));
