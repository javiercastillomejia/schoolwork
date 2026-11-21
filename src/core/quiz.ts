import { shuffle, type Rng } from '../lib/random';
import { EXAM_LENGTH } from './profile';
import type { Question, UnitContent } from './types';

/** Opciones que se enseñan: la buena y (count − 1) incorrectas al azar, barajadas. */
export function optionsFor(question: Question, count: number, rng: Rng = Math.random): string[] {
  const [correct, ...wrong] = question.options;
  const picked = shuffle(wrong, rng).slice(0, Math.max(1, count - 1));
  return shuffle([correct, ...picked], rng);
}

export function correctOption(question: Question): string {
  return question.options[0];
}

/** Estrellas según el porcentaje de aciertos: 3 (≥ 90 %), 2 (≥ 70 %), 1 (≥ 50 %) o 0. */
export function starsFor(percent: number | undefined): number {
  if (percent === undefined) return 0;
  if (percent >= 90) return 3;
  if (percent >= 70) return 2;
  if (percent >= 50) return 1;
  return 0;
}

/** Un tema (o el examen) cuenta como aprobado con un 70 % o más. */
export const PASS_PERCENT = 70;

export function percentOf(right: number, total: number): number {
  return total === 0 ? 0 : Math.round((right / total) * 100);
}

/** Nota sobre 10 con un decimal, como en clase. */
export function gradeOf(right: number, total: number): number {
  return total === 0 ? 0 : Math.round((right / total) * 100) / 10;
}

export function gradeLabel(grade: number): string {
  if (grade >= 9) return 'Sobresaliente';
  if (grade >= 7) return 'Notable';
  if (grade >= 6) return 'Bien';
  if (grade >= 5) return 'Suficiente';
  return 'Insuficiente';
}

/** "8,5" */
export function formatGrade(grade: number): string {
  return Number.isInteger(grade) ? String(grade) : grade.toFixed(1).replace('.', ',');
}

/**
 * Examen final: `EXAM_LENGTH` preguntas al azar de toda la unidad, con un
 * máximo por tema para que salgan temas variados.
 */
export function examQuestions(unit: UnitContent, rng: Rng = Math.random, length = EXAM_LENGTH): Question[] {
  const perTopicCap = Math.max(1, Math.ceil((length / Math.max(1, unit.topics.length)) * 2));
  const counts = new Map<string, number>();
  const chosen: Question[] = [];
  const pool = shuffle(unit.questions, rng);
  for (const q of pool) {
    if (chosen.length >= length) break;
    const n = counts.get(q.topic) ?? 0;
    if (n >= perTopicCap) continue;
    counts.set(q.topic, n + 1);
    chosen.push(q);
  }
  // Si el tope por tema deja huecos (unidades con pocos temas), se completan con el resto.
  for (const q of pool) {
    if (chosen.length >= length) break;
    if (!chosen.includes(q)) chosen.push(q);
  }
  return chosen;
}
