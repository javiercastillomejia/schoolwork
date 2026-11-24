import { WEEKS } from '../data/verbs';
import { MAX_AGE, MIN_AGE } from '../engine/profile';
import type { CardState } from '../engine/srs';

export interface Settings {
  /** Nombre con el que Baco se dirige al alumno. */
  name: string;
  /** Edad (8–16); null si aún no la ha dicho. */
  age: number | null;
  /** Semana en la que va la clase: hasta aquí entran verbos nuevos. */
  currentWeek: number;
  /** Leer en voz alta el verbo al presentarlo y al corregir. */
  autoSpeak: boolean;
  /** Ya se ha elegido la semana la primera vez. */
  onboarded: boolean;
}

export interface Progress {
  version: 1;
  cards: Record<number, CardState | undefined>;
  settings: Settings;
  /** Días (dayNumber) en los que se ha estudiado algo. */
  studyDays: number[];
  /** Estrellas ganadas: una por cada acierto a la primera. */
  stars: number;
  /** Notas de los exámenes, de la más antigua a la más reciente. */
  exams: ExamRecord[];
}

export interface ExamRecord {
  /** "w3" para la semana 3, "all" para todo lo estudiado. */
  key: string;
  grade: number;
  day: number;
}

/** Exámenes que se guardan como mucho. */
const MAX_EXAMS = 60;

export function addExam(exams: ExamRecord[], record: ExamRecord): ExamRecord[] {
  return [...exams, record].slice(-MAX_EXAMS);
}

export function lastExam(exams: ExamRecord[], key: string): ExamRecord | undefined {
  return [...exams].reverse().find((exam) => exam.key === key);
}

const STORAGE_KEY = 'verbos-irregulares:v1';

export function emptyProgress(): Progress {
  return {
    version: 1,
    cards: {},
    settings: { name: '', age: null, currentWeek: 1, autoSpeak: true, onboarded: false },
    studyDays: [],
    stars: 0,
    exams: [],
  };
}

/** Falta el nombre o la edad (también en quien empezó antes de que se preguntaran). */
export function needsProfile(settings: Settings): boolean {
  return settings.name.trim() === '' || settings.age === null;
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, 24);
}

function cleanAge(value: unknown): number | null {
  const age = Number(value);
  if (!Number.isInteger(age)) return null;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, age));
}

export function loadProgress(): Progress {
  const fresh = emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (parsed.version !== 1) return fresh;
    const saved: Partial<Settings> = parsed.settings ?? {};
    const week = Number(saved.currentWeek);
    return {
      version: 1,
      cards: parsed.cards ?? {},
      settings: {
        name: typeof saved.name === 'string' ? cleanName(saved.name) : '',
        age: saved.age === null || saved.age === undefined ? null : cleanAge(saved.age),
        currentWeek: WEEKS.includes(week) ? week : 1,
        autoSpeak: typeof saved.autoSpeak === 'boolean' ? saved.autoSpeak : true,
        onboarded: saved.onboarded === true,
      },
      studyDays: Array.isArray(parsed.studyDays) ? parsed.studyDays : [],
      stars: typeof parsed.stars === 'number' && parsed.stars >= 0 ? parsed.stars : 0,
      exams: Array.isArray(parsed.exams) ? parsed.exams.filter(isExamRecord) : [],
    };
  } catch {
    return fresh;
  }
}

function isExamRecord(value: unknown): value is ExamRecord {
  const record = value as ExamRecord;
  return typeof record?.key === 'string' && typeof record.grade === 'number' && typeof record.day === 'number';
}

/** Guarda el progreso; devuelve false si el navegador no deja (modo privado, sin espacio…). */
export function saveProgress(progress: Progress): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
