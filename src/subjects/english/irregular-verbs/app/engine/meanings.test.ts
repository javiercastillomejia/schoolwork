import { describe, expect, it } from 'vitest';
import { VERBS } from '../data/verbs';
import { checkMeaning, meaningOptions } from './meanings';

const verb = (base: string) => VERBS.find((v) => v.base === base)!;

describe('significados', () => {
  it('separa los significados de la hoja', () => {
    expect(meaningOptions(verb('begin'))).toEqual(['empezar', 'comenzar']);
    expect(meaningOptions(verb('let'))).toEqual(['dejar', 'permitir']);
    expect(meaningOptions(verb('meet'))).toEqual(['encontrarse', 'quedar con']);
    expect(meaningOptions(verb('become'))).toEqual(['llegar a ser']);
    expect(meaningOptions(verb('stand'))).toEqual(['estar de pie', 'colocar']);
  });

  it('todos los verbos tienen al menos un significado', () => {
    for (const v of VERBS) expect(meaningOptions(v).length, v.base).toBeGreaterThan(0);
  });

  it('vale cualquiera de los significados, sin fijarse en tildes ni mayúsculas', () => {
    expect(checkMeaning(verb('begin'), 'empezar')).toEqual({ correct: true, others: ['comenzar'] });
    expect(checkMeaning(verb('begin'), ' Comenzar ').correct).toBe(true);
    expect(checkMeaning(verb('hear'), 'oir').correct).toBe(true);
    expect(checkMeaning(verb('teach'), 'ensenar').correct).toBe(true);
    expect(checkMeaning(verb('begin'), 'empezar / comenzar')).toEqual({ correct: true, others: [] });
    expect(checkMeaning(verb('meet'), 'quedar con').correct).toBe(true);
  });

  it('no vale un significado que no es de la hoja', () => {
    expect(checkMeaning(verb('begin'), 'terminar').correct).toBe(false);
    expect(checkMeaning(verb('begin'), 'empezar, terminar').correct).toBe(false);
    expect(checkMeaning(verb('begin'), '').correct).toBe(false);
  });
});
