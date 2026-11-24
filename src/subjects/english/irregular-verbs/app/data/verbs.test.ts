import { describe, expect, it } from 'vitest';
import { FAMILIES, VERBS, WEEKS, splitExample, verbsOfWeek } from './verbs';

describe('datos de los verbos', () => {
  it('tiene los 74 verbos de la hoja, numerados del 1 al 74', () => {
    expect(VERBS).toHaveLength(74);
    VERBS.forEach((verb, index) => expect(verb.id).toBe(index + 1));
  });

  it('respeta las semanas de la hoja (7 por semana, 4 en la 11)', () => {
    expect(WEEKS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const week of WEEKS) expect(verbsOfWeek(week)).toHaveLength(week === 11 ? 4 : 7);
    expect(verbsOfWeek(1).map((v) => v.base)).toEqual(['be', 'become', 'begin', 'bite', 'break', 'bring', 'build']);
    expect(verbsOfWeek(6).at(-1)?.base).toBe('let');
    expect(verbsOfWeek(11).map((v) => v.base)).toEqual(['wake', 'wear', 'win', 'write']);
  });

  it('no repite infinitivos', () => {
    expect(new Set(VERBS.map((v) => v.base)).size).toBe(74);
  });

  it('solo "to be" exige escribir todas sus formas', () => {
    expect(VERBS.filter((v) => v.needsAll).map((v) => v.base)).toEqual(['be']);
  });

  it('recoge las formas dobles de la hoja', () => {
    const byBase = Object.fromEntries(VERBS.map((v) => [v.base, v.past]));
    expect(byBase.be).toEqual(['was', 'were']);
    expect(byBase.burn).toEqual(['burnt', 'burned']);
    expect(byBase.learn).toEqual(['learnt', 'learned']);
    expect(byBase.dream).toEqual(['dreamt']);
    expect(byBase.spell).toEqual(['spelt']);
  });

  it('cada verbo tiene familia y significado', () => {
    for (const verb of VERBS) {
      expect(FAMILIES[verb.family]).toBeDefined();
      expect(verb.meaning.length).toBeGreaterThan(0);
    }
  });

  it('la frase de ejemplo usa una forma de past de la hoja', () => {
    for (const verb of VERBS) {
      const [before, past, after] = splitExample(verb);
      expect(verb.past, verb.base).toContain(past);
      expect(before + past + after).not.toContain('{');
    }
  });
});
