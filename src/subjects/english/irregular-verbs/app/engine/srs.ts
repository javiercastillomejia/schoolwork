/**
 * Repetición espaciada con cajas de Leitner.
 *
 * Cada verbo está en una caja (1–5). Al acertar sube una caja y tarda más en
 * volver; al fallar vuelve a la caja 1 y se repite en la misma sesión.
 * La caja 0 significa "todavía no presentado".
 */

export const MAX_BOX = 5;

/** Días hasta el siguiente repaso al llegar a cada caja. */
export const INTERVAL_DAYS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 };

/** Días hasta el siguiente repaso cuando se acierta un verbo que ya estaba en la caja 5. */
export const MASTERED_INTERVAL = 30;

export interface CardState {
  box: number;
  /** Día (ver dayNumber) a partir del cual toca repasarlo. */
  due: number;
  seen: number;
  correct: number;
  wrong: number;
  lastSeen: number | null;
  /** Día en que se presentó (no existe en el progreso guardado antes de añadirlo). */
  introduced?: number;
}

export type QuestionKind = 'choice' | 'write';

export function newCard(): CardState {
  return { box: 0, due: 0, seen: 0, correct: 0, wrong: 0, lastSeen: null };
}

/** Día local como número entero (cambia a medianoche, hora del dispositivo). */
export function dayNumber(date: Date = new Date()): number {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000);
}

/** El verbo se acaba de presentar: entra en la caja 1. */
export function introduce(card: CardState, today: number): CardState {
  if (card.box > 0) return card;
  return { ...card, box: 1, due: today, lastSeen: today, introduced: today };
}

export function applyAnswer(card: CardState, correct: boolean, today: number): CardState {
  const base = { ...card, seen: card.seen + 1, lastSeen: today };
  if (!correct) {
    return { ...base, box: 1, due: today, wrong: card.wrong + 1 };
  }
  const wasMastered = card.box >= MAX_BOX;
  const box = Math.min(Math.max(card.box, 1) + 1, MAX_BOX);
  const interval = wasMastered ? MASTERED_INTERVAL : (INTERVAL_DAYS[box] ?? 0);
  return { ...base, box, due: today + interval, correct: card.correct + 1 };
}

/**
 * Respuesta en un repaso extra, a un verbo al que todavía no le tocaba: un
 * acierto no adelanta su próximo repaso (repasar antes de tiempo afianza
 * menos), pero un fallo sí cuenta y lo devuelve a la caja 1.
 */
export function applyPracticeAnswer(card: CardState, correct: boolean, today: number): CardState {
  if (!correct) return applyAnswer(card, false, today);
  return { ...card, seen: card.seen + 1, correct: card.correct + 1, lastSeen: today };
}

export function isDue(card: CardState, today: number): boolean {
  return card.box >= 1 && card.due <= today;
}
