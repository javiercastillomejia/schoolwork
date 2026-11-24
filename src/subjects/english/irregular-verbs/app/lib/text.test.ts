import { describe, expect, it } from 'vitest';
import { diffWords } from './diff';
import { editDistance, normalize, splitForms } from './text';

describe('texto', () => {
  it('normaliza respuestas', () => {
    expect(normalize('  To  Brought. ')).toBe('brought');
  });

  it('separa formas múltiples', () => {
    expect(splitForms('was / were')).toEqual(['was', 'were']);
    expect(splitForms('was y were')).toEqual(['was', 'were']);
  });

  it('cuenta el cambio de dos letras vecinas como un error', () => {
    expect(editDistance('brougth', 'brought')).toBe(1);
    expect(editDistance('bought', 'brought')).toBe(1);
    expect(editDistance('cat', 'cut')).toBe(1);
  });

  it('marca las letras que no coinciden', () => {
    const { answer, solution } = diffWords('brougt', 'brought');
    expect(answer.every((p) => !p.changed)).toBe(true);
    expect(solution).toEqual([
      { text: 'broug', changed: false },
      { text: 'h', changed: true },
      { text: 't', changed: false },
    ]);
  });
});
