import { describe, expect, it } from 'vitest';
import { VERBS } from '../data/verbs';
import { seededRng } from '../lib/random';
import { pastChoices } from './distractors';

describe('pastChoices', () => {
  it('da 4 opciones distintas con una sola correcta, para todos los verbos', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const rng = seededRng(seed);
      for (const verb of VERBS) {
        const { options, correct } = pastChoices(verb, rng);
        expect(options, verb.base).toHaveLength(4);
        expect(new Set(options).size, verb.base).toBe(4);
        expect(options).toContain(correct);
        const wrong = options.filter((o) => o !== correct);
        for (const option of wrong) {
          expect(verb.past, `${verb.base}: ${option}`).not.toContain(option);
          // Nunca se presenta como error algo que en inglés es correcto.
          expect(verb.otherValid, `${verb.base}: ${option}`).not.toContain(option);
        }
      }
    }
  });

  it('incluye el error típico de añadir -ed', () => {
    const bring = VERBS.find((v) => v.base === 'bring')!;
    expect(pastChoices(bring, seededRng(3)).options).toContain('bringed');
  });

  it('en to be la opción correcta es was/were', () => {
    const be = VERBS.find((v) => v.base === 'be')!;
    expect(pastChoices(be, seededRng(1)).correct).toBe('was/were');
  });
});

describe('pastChoices: calidad', () => {
  it('no ofrece palabras malsonantes', () => {
    const shoot = VERBS.find((v) => v.base === 'shoot')!;
    for (let seed = 1; seed <= 50; seed++) {
      expect(pastChoices(shoot, seededRng(seed)).options).not.toContain('shat');
    }
  });

  it('en los verbos -ought ofrece la confusión de ortografía', () => {
    const teach = VERBS.find((v) => v.base === 'teach')!;
    const seen = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) pastChoices(teach, seededRng(seed)).options.forEach((o) => seen.add(o));
    expect(seen.has('tought') || seen.has('taugth')).toBe(true);
  });
});
