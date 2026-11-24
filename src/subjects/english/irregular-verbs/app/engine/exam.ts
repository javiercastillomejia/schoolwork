import { getVerb, pastLabel, type Verb } from '../data/verbs';
import { shuffle, type Rng } from '../lib/random';
import { normalize } from '../lib/text';
import { checkPast } from './answers';
import { checkMeaning, meaningOptions } from './meanings';
import { cardOf, type Cards } from './session';

export type ExamField = 'base' | 'past' | 'meaning';
export const EXAM_FIELDS: ExamField[] = ['base', 'past', 'meaning'];

/** Una fila del examen: el verbo y qué casilla se le da hecha. */
export interface ExamRow {
  verbId: number;
  given: ExamField;
}

export type ExamAnswers = Partial<Record<ExamField, string>>;

export interface CellResult {
  field: ExamField;
  given: boolean;
  /** Lo que se ve en la casilla: lo que se le dio o lo que escribió. */
  text: string;
  correct: boolean;
  /** La respuesta de la hoja. */
  solution: string;
  /** Otras respuestas que también valían ("también: empezar"). */
  note: string | null;
}

export type ExamScope = { type: 'week'; week: number } | { type: 'all' };

/** Como mucho, filas de un examen de "todo lo estudiado". */
export const MAX_EXAM_ROWS = 20;

export function scopeKey(scope: ExamScope): string {
  return scope.type === 'week' ? `w${scope.week}` : 'all';
}

/** Verbos del examen: solo los ya estudiados; si son muchos, una muestra al azar. */
export function examVerbs(cards: Cards, scope: ExamScope, verbs: Verb[], rng: Rng = Math.random): number[] {
  const studied = verbs.filter(
    (verb) => cardOf(cards, verb.id).box >= 1 && (scope.type === 'all' || verb.week === scope.week),
  );
  return shuffle(studied, rng)
    .slice(0, MAX_EXAM_ROWS)
    .sort((a, b) => a.id - b.id)
    .map((verb) => verb.id);
}

/** Filas en el orden de la hoja, repartiendo por igual qué casilla se da hecha. */
export function buildExam(verbIds: number[], rng: Rng = Math.random): ExamRow[] {
  const pattern = shuffle(
    verbIds.map((_, i) => EXAM_FIELDS[i % EXAM_FIELDS.length] as ExamField),
    rng,
  );
  return verbIds.map((verbId, i) => ({ verbId, given: pattern[i] ?? 'base' }));
}

export function fieldText(verb: Verb, field: ExamField): string {
  if (field === 'base') return `to ${verb.base}`;
  if (field === 'past') return pastLabel(verb);
  return meaningOptions(verb).join(' / ');
}

export function gradeRow(row: ExamRow, answers: ExamAnswers): CellResult[] {
  const verb = getVerb(row.verbId);
  return EXAM_FIELDS.map((field) => {
    const solution = fieldText(verb, field);
    if (field === row.given) return { field, given: true, text: solution, correct: true, solution, note: null };
    const typed = (answers[field] ?? '').trim();
    if (field === 'base') {
      return { field, given: false, text: typed, correct: normalize(typed) === verb.base, solution, note: null };
    }
    if (field === 'past') {
      const correct = typed !== '' && checkPast(verb, typed).correct;
      const others = verb.needsAll ? [] : verb.past.filter((form) => form !== normalize(typed));
      return { field, given: false, text: typed, correct, solution, note: correct && others.length ? `también: ${others.join(', ')}` : null };
    }
    const meaning = checkMeaning(verb, typed);
    return {
      field,
      given: false,
      text: typed,
      correct: meaning.correct,
      solution,
      note: meaning.correct && meaning.others.length ? `también: ${meaning.others.join(', ')}` : null,
    };
  });
}

export interface ExamScore {
  right: number;
  total: number;
  /** Nota sobre 10 con un decimal. */
  grade: number;
  label: string;
}

export function examScore(results: CellResult[][]): ExamScore {
  const cells = results.flat().filter((cell) => !cell.given);
  const right = cells.filter((cell) => cell.correct).length;
  const total = cells.length;
  const grade = total === 0 ? 0 : Math.round((right / total) * 100) / 10;
  return { right, total, grade, label: gradeLabel(grade) };
}

export function gradeLabel(grade: number): string {
  if (grade >= 9) return 'Sobresaliente';
  if (grade >= 7) return 'Notable';
  if (grade >= 6) return 'Bien';
  if (grade >= 5) return 'Suficiente';
  return 'Insuficiente';
}

/** 8.6 → "8,6"; 10 → "10". */
export function formatGrade(grade: number): string {
  return String(grade).replace('.', ',');
}
