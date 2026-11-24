import { describe, expect, it } from 'vitest';
import { VERBS } from '../data/verbs';
import { seededRng } from '../lib/random';
import { buildExam, examScore, examVerbs, formatGrade, gradeRow, MAX_EXAM_ROWS, type ExamRow } from './exam';
import type { Cards } from './session';
import type { CardState } from './srs';

const card = (box: number): CardState => ({ box, due: 0, seen: 1, correct: 1, wrong: 0, lastSeen: 0 });

describe('examen', () => {
  it('solo entran verbos estudiados, en el orden de la hoja', () => {
    const cards: Cards = { 1: card(2), 3: card(1), 9: card(4) };
    expect(examVerbs(cards, { type: 'week', week: 1 }, VERBS, seededRng(1))).toEqual([1, 3]);
    expect(examVerbs(cards, { type: 'all' }, VERBS, seededRng(1))).toEqual([1, 3, 9]);
  });

  it('"todo lo estudiado" tiene como mucho 20 filas', () => {
    const cards: Cards = {};
    for (let id = 1; id <= 74; id++) cards[id] = card(2);
    expect(examVerbs(cards, { type: 'all' }, VERBS, seededRng(2))).toHaveLength(MAX_EXAM_ROWS);
  });

  it('reparte qué casilla se da hecha', () => {
    const rows = buildExam([1, 2, 3, 4, 5, 6], seededRng(3));
    const given = rows.map((row) => row.given);
    expect(given.filter((g) => g === 'base')).toHaveLength(2);
    expect(given.filter((g) => g === 'past')).toHaveLength(2);
    expect(given.filter((g) => g === 'meaning')).toHaveLength(2);
  });

  it('corrige cada casilla y acepta cualquier significado de la hoja', () => {
    const row: ExamRow = { verbId: 3, given: 'base' };
    const [base, past, meaning] = gradeRow(row, { past: 'began', meaning: 'Comenzar' });
    expect(base).toMatchObject({ given: true, text: 'to begin' });
    expect(past).toMatchObject({ correct: true, note: null });
    expect(meaning).toMatchObject({ correct: true, note: 'también: empezar' });
  });

  it('el infinitivo vale con o sin "to" y el pasado sigue las reglas de la hoja', () => {
    const [base, past] = gradeRow({ verbId: 4, given: 'meaning' }, { base: 'to bite', past: 'bited' });
    expect(base?.correct).toBe(true);
    expect(past).toMatchObject({ correct: false, solution: 'bit' });
    const [, burnt] = gradeRow({ verbId: 8, given: 'base' }, { past: 'burnt', meaning: 'quemar' });
    expect(burnt).toMatchObject({ correct: true, note: 'también: burned' });
  });

  it('una casilla vacía cuenta como fallo', () => {
    const [, past] = gradeRow({ verbId: 6, given: 'base' }, {});
    expect(past?.correct).toBe(false);
  });

  it('la nota es sobre 10 con un decimal', () => {
    const results = [
      gradeRow({ verbId: 3, given: 'base' }, { past: 'began', meaning: 'empezar' }),
      gradeRow({ verbId: 4, given: 'meaning' }, { base: 'bite', past: 'bited' }),
      gradeRow({ verbId: 6, given: 'past' }, { base: 'bring', meaning: 'traer' }),
    ];
    const score = examScore(results);
    expect(score).toMatchObject({ right: 5, total: 6, grade: 8.3, label: 'Notable' });
    expect(formatGrade(score.grade)).toBe('8,3');
    expect(formatGrade(10)).toBe('10');
  });
});
