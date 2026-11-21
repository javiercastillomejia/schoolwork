import { MAX_AGE, MIN_AGE } from '../core/profile';
import type { CardState, Cards } from '../core/srs';

/**
 * Todo el progreso vive en el navegador (localStorage) bajo una sola clave:
 * el perfil (nombre, edad), los días estudiados (la racha es común a todas
 * las asignaturas) y el progreso de cada unidad.
 */

export interface Settings {
  /** Nombre con el que la mascota se dirige al alumno. */
  name: string;
  /** Edad; null si aún no la ha dicho. */
  age: number | null;
  /** Leer en voz alta cada pregunta al salir. */
  autoSpeak: boolean;
}

export interface ExamRecord {
  /** Nota sobre 10. */
  grade: number;
  percent: number;
  day: number;
}

export interface UnitProgress {
  cards: Cards;
  /** Mejor porcentaje de cada quiz de tema (por id de tema). */
  best: Record<string, number | undefined>;
  /** Exámenes finales, del más antiguo al más reciente. */
  exams: ExamRecord[];
  /** Temas cuya ficha se ha abierto. */
  read: string[];
  /** Premios de la mascota: uno por cada acierto a la primera. */
  rewards: number;
}

export interface Store {
  version: 1;
  settings: Settings;
  /** Días (dayNumber) en los que se ha estudiado algo, en cualquier asignatura. */
  studyDays: number[];
  /** Progreso por unidad: clave `<asignatura>/<unidad>`. */
  units: Record<string, UnitProgress | undefined>;
}

const STORAGE_KEY = 'schoolwork:v1';
const MAX_EXAMS = 60;

export function emptyUnit(): UnitProgress {
  return { cards: {}, best: {}, exams: [], read: [], rewards: 0 };
}

export function emptyStore(): Store {
  return {
    version: 1,
    settings: { name: '', age: null, autoSpeak: false },
    studyDays: [],
    units: {},
  };
}

export function unitKey(subjectId: string, unitId: string): string {
  return `${subjectId}/${unitId}`;
}

export function unitOf(store: Store, key: string): UnitProgress {
  return store.units[key] ?? emptyUnit();
}

/** Cambia el progreso de una unidad sin tocar el resto. */
export function updateUnit(store: Store, key: string, change: (unit: UnitProgress) => UnitProgress): Store {
  return { ...store, units: { ...store.units, [key]: change(unitOf(store, key)) } };
}

export function markStudied(store: Store, today: number): Store {
  return store.studyDays.includes(today) ? store : { ...store, studyDays: [...store.studyDays, today].slice(-400) };
}

export function addExam(exams: ExamRecord[], record: ExamRecord): ExamRecord[] {
  return [...exams, record].slice(-MAX_EXAMS);
}

/** Falta el nombre o la edad. */
export function needsProfile(settings: Settings): boolean {
  return settings.name.trim() === '' || settings.age === null;
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, 24);
}

function cleanAge(value: unknown): number | null {
  const age = Number(value);
  if (value === null || value === undefined || !Number.isInteger(age)) return null;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, age));
}

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function cleanCard(value: unknown): CardState | undefined {
  const c = value as Partial<CardState> | null;
  if (!c || !isNumber(c.box) || !isNumber(c.due)) return undefined;
  return {
    box: Math.min(5, Math.max(0, Math.round(c.box))),
    due: c.due,
    seen: isNumber(c.seen) ? c.seen : 0,
    correct: isNumber(c.correct) ? c.correct : 0,
    wrong: isNumber(c.wrong) ? c.wrong : 0,
    lastSeen: isNumber(c.lastSeen) ? c.lastSeen : null,
    ...(isNumber(c.introduced) ? { introduced: c.introduced } : {}),
  };
}

function cleanUnit(value: unknown): UnitProgress {
  const u = (value ?? {}) as Partial<UnitProgress>;
  const cards: Cards = {};
  for (const [id, card] of Object.entries(u.cards ?? {})) {
    const clean = cleanCard(card);
    if (clean) cards[id] = clean;
  }
  const best: Record<string, number> = {};
  for (const [id, percent] of Object.entries(u.best ?? {})) {
    if (isNumber(percent)) best[id] = Math.min(100, Math.max(0, percent));
  }
  return {
    cards,
    best,
    exams: Array.isArray(u.exams)
      ? u.exams.filter((e): e is ExamRecord => isNumber(e?.grade) && isNumber(e?.percent) && isNumber(e?.day))
      : [],
    read: Array.isArray(u.read) ? u.read.filter((id): id is string => typeof id === 'string') : [],
    rewards: isNumber(u.rewards) && u.rewards >= 0 ? u.rewards : 0,
  };
}

/** Lee lo guardado; si falta o está estropeado, empieza de cero sin fallar. */
export function parseStore(raw: string | null): Store {
  const fresh = emptyStore();
  if (!raw) return fresh;
  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    if (parsed?.version !== 1) return fresh;
    const saved: Partial<Settings> = parsed.settings ?? {};
    const units: Record<string, UnitProgress> = {};
    for (const [key, unit] of Object.entries(parsed.units ?? {})) units[key] = cleanUnit(unit);
    return {
      version: 1,
      settings: {
        name: typeof saved.name === 'string' ? cleanName(saved.name) : '',
        age: cleanAge(saved.age),
        autoSpeak: saved.autoSpeak === true,
      },
      studyDays: Array.isArray(parsed.studyDays) ? parsed.studyDays.filter(isNumber) : [],
      units,
    };
  } catch {
    return fresh;
  }
}

export function loadStore(): Store {
  try {
    return parseStore(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyStore();
  }
}

/** Guarda; devuelve false si el navegador no deja (modo privado, sin espacio…). */
export function saveStore(store: Store): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
