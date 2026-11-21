/**
 * Repetición espaciada con cajas de Leitner (igual que en la app de verbos).
 *
 * Cada pregunta está en una caja (1–5). Al acertar sube una caja y tarda más
 * en volver; al fallar vuelve a la caja 1 y se repite en la misma sesión.
 * La caja 0 significa "todavía no ha salido".
 */

export const MAX_BOX = 5;

/** Días hasta el siguiente repaso al llegar a cada caja. */
export const INTERVAL_DAYS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 };

/** Días hasta el siguiente repaso cuando se acierta una que ya estaba en la caja 5. */
export const MASTERED_INTERVAL = 30;

export interface CardState {
  box: number;
  /** Día (ver dayNumber) a partir del cual toca repasarla. */
  due: number;
  seen: number;
  correct: number;
  wrong: number;
  lastSeen: number | null;
  /** Día en que salió por primera vez. */
  introduced?: number;
}

export type Cards = Record<string, CardState | undefined>;

export function newCard(): CardState {
  return { box: 0, due: 0, seen: 0, correct: 0, wrong: 0, lastSeen: null };
}

export function cardOf(cards: Cards, id: string): CardState {
  return cards[id] ?? newCard();
}

/** Día local como número entero (cambia a medianoche, hora del dispositivo). */
export function dayNumber(date: Date = new Date()): number {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000);
}

/** Respuesta en el reto del día: acertar sube de caja; fallar devuelve a la caja 1. */
export function applyAnswer(card: CardState, correct: boolean, today: number): CardState {
  const base: CardState = {
    ...card,
    seen: card.seen + 1,
    lastSeen: today,
    introduced: card.introduced ?? today,
  };
  if (!correct) return { ...base, box: 1, due: today, wrong: card.wrong + 1 };
  const wasMastered = card.box >= MAX_BOX;
  const box = Math.min(Math.max(card.box, 1) + 1, MAX_BOX);
  const interval = wasMastered ? MASTERED_INTERVAL : (INTERVAL_DAYS[box] ?? 0);
  return { ...base, box, due: today + interval, correct: card.correct + 1 };
}

/**
 * Respuesta fuera del reto (quiz de un tema, examen, repaso de fallos).
 * Fallar siempre cuenta y la devuelve a la caja 1. Acertar cuenta como repaso
 * si la pregunta era nueva o ya le tocaba; si no, no adelanta el próximo
 * repaso (repasar antes de tiempo afianza menos).
 */
export function applyFreeAnswer(card: CardState, correct: boolean, today: number): CardState {
  if (!correct || card.box === 0 || isDue(card, today)) return applyAnswer(card, correct, today);
  return { ...card, seen: card.seen + 1, correct: card.correct + 1, lastSeen: today };
}

export function isDue(card: CardState, today: number): boolean {
  return card.box >= 1 && card.due <= today;
}
