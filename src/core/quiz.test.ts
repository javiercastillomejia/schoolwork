import { describe, expect, it } from 'vitest';
import { seededRng } from '../lib/random';
import { QUESTIONS, unit2 } from '../subjects/natural-science/unit-2';
import { examQuestions, formatGrade, gradeLabel, gradeOf, optionsFor, percentOf, starsFor } from './quiz';

describe('preguntas', () => {
  const q = QUESTIONS[0]!;

  it('las opciones incluyen siempre la correcta y salen barajadas', () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 30; seed++) {
      const options = optionsFor(q, 4, seededRng(seed));
      expect(options).toHaveLength(4);
      expect(options).toContain(q.options[0]);
      seen.add(options.indexOf(q.options[0]));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('con 3 opciones se quita una incorrecta', () => {
    const options = optionsFor(q, 3, seededRng(2));
    expect(options).toHaveLength(3);
    expect(options).toContain(q.options[0]);
  });
});

describe('notas y estrellas', () => {
  it('estrellas: ≥90 % tres, ≥70 % dos, ≥50 % una', () => {
    expect([100, 90, 89, 70, 69, 50, 49, 0].map(starsFor)).toEqual([3, 3, 2, 2, 1, 1, 0, 0]);
    expect(starsFor(undefined)).toBe(0);
  });

  it('nota sobre 10 y calificación como en clase', () => {
    expect(gradeOf(17, 20)).toBe(8.5);
    expect(formatGrade(8.5)).toBe('8,5');
    expect(formatGrade(10)).toBe('10');
    expect(percentOf(7, 10)).toBe(70);
    expect([10, 9, 8, 7, 6.5, 5, 4.9].map(gradeLabel)).toEqual([
      'Sobresaliente',
      'Sobresaliente',
      'Notable',
      'Notable',
      'Bien',
      'Suficiente',
      'Insuficiente',
    ]);
  });
});

describe('examen final', () => {
  it('20 preguntas distintas de varios temas', () => {
    for (let seed = 0; seed < 20; seed++) {
      const exam = examQuestions(unit2, seededRng(seed));
      expect(exam).toHaveLength(20);
      expect(new Set(exam.map((q) => q.id)).size).toBe(20);
      const perTopic = new Map<string, number>();
      exam.forEach((q) => perTopic.set(q.topic, (perTopic.get(q.topic) ?? 0) + 1));
      expect(Math.max(...perTopic.values())).toBeLessThanOrEqual(4);
      expect(perTopic.size).toBeGreaterThanOrEqual(5);
    }
  });
});
