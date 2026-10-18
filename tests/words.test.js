import { describe, expect, it } from 'vitest';
import words from '../src/data/words.json';

describe('words.json', () => {
  it('has unique ids', () => {
    const ids = words.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry has the required text fields', () => {
    for (const w of words) {
      for (const k of ['id', 'de', 'meaning', 'example_de', 'example_en']) {
        expect(typeof w[k] === 'string' && w[k].length > 0, `${w.id}.${k}`).toBe(true);
      }
    }
  });

  it('uses only der/die/das or null as article', () => {
    for (const w of words) expect(['der', 'die', 'das', null], w.id).toContain(w.article);
  });

  it('capitalizes nouns and spells plurals out (no list notation)', () => {
    for (const w of words.filter((w) => w.article)) {
      expect(w.de[0], w.id).toMatch(/[A-ZÄÖÜ(]/);
      if (w.plural) expect(w.plural, w.id).not.toMatch(/^[-=]|, ?-/);
    }
  });
});
