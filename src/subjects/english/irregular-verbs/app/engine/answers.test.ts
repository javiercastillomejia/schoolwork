import { describe, expect, it } from 'vitest';
import { VERBS } from '../data/verbs';
import { checkPast, regularize } from './answers';

const verb = (base: string) => {
  const found = VERBS.find((v) => v.base === base);
  if (!found) throw new Error(base);
  return found;
};

describe('regularize', () => {
  it('construye el error típico de añadir -ed', () => {
    expect(regularize('bring')).toBe('bringed');
    expect(regularize('buy')).toBe('buyed');
    expect(regularize('fly')).toBe('flied');
    expect(regularize('cut')).toBe('cutted');
    expect(regularize('swim')).toBe('swimmed');
    expect(regularize('write')).toBe('writed');
    expect(regularize('go')).toBe('goed');
  });
});

describe('checkPast', () => {
  it('acepta la forma de la hoja sin importar mayúsculas, espacios ni "to"', () => {
    expect(checkPast(verb('bring'), 'brought').correct).toBe(true);
    expect(checkPast(verb('bring'), '  Brought ').correct).toBe(true);
    expect(checkPast(verb('bring'), 'to brought').correct).toBe(true);
    expect(checkPast(verb('bring'), 'brought.').correct).toBe(true);
  });

  it('en burn y learn vale cualquiera de las dos formas, o las dos', () => {
    expect(checkPast(verb('burn'), 'burnt').correct).toBe(true);
    expect(checkPast(verb('burn'), 'burned').correct).toBe(true);
    expect(checkPast(verb('learn'), 'learnt, learned').correct).toBe(true);
  });

  it('en to be pide was y were', () => {
    expect(checkPast(verb('be'), 'was/were').correct).toBe(true);
    expect(checkPast(verb('be'), 'were, was').correct).toBe(true);
    expect(checkPast(verb('be'), 'was or were').correct).toBe(true);
    const onlyOne = checkPast(verb('be'), 'was');
    expect(onlyOne.correct).toBe(false);
    if (!onlyOne.correct) expect(onlyOne.kind).toBe('missingForm');
  });

  it('solo acepta la forma de la hoja en dreamt y spelt, pero avisa de que la otra existe', () => {
    for (const [base, other] of [
      ['dream', 'dreamed'],
      ['spell', 'spelled'],
    ] as const) {
      const result = checkPast(verb(base), other);
      expect(result.correct).toBe(false);
      if (!result.correct) expect(result.kind).toBe('otherValid');
    }
  });

  it('reconoce los errores típicos', () => {
    const cases: [string, string, string][] = [
      ['bring', 'bringed', 'regularized'],
      ['cut', 'cutted', 'regularized'],
      ['choose', 'choose', 'infinitive'],
      ['bring', 'bought', 'otherVerb'],
      ['bring', 'brougth', 'typo'],
      ['catch', 'cought', 'typo'],
      ['bring', 'brang', 'wrong'],
      ['go', '', 'empty'],
    ];
    for (const [base, answer, kind] of cases) {
      const result = checkPast(verb(base), answer);
      expect(result.correct, `${base} → ${answer}`).toBe(false);
      if (!result.correct) expect(result.kind, `${base} → ${answer}`).toBe(kind);
    }
  });

  it('todas las formas de la hoja se aceptan', () => {
    for (const v of VERBS) {
      const answer = v.needsAll ? v.past.join('/') : v.past[0]!;
      expect(checkPast(v, answer).correct, v.base).toBe(true);
    }
  });
});
