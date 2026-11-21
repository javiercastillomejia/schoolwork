import { PASS_PERCENT, starsFor } from './quiz';
import { cardOf, MAX_BOX, type Cards } from './srs';
import type { UnitContent } from './types';

/** Días seguidos estudiando, contando hoy o, si hoy aún no, hasta ayer. */
export function currentStreak(studyDays: number[], today: number): number {
  const days = new Set(studyDays);
  let day = days.has(today) ? today : today - 1;
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day--;
  }
  return streak;
}

export type TopicState = 'done' | 'started' | 'new';

export interface TopicProgress {
  topicId: string;
  total: number;
  /** Preguntas que ya han salido. */
  seen: number;
  /** Preguntas acertadas al menos una vez después de salir (caja ≥ 2). */
  learned: number;
  best: number | undefined;
  stars: number;
  state: TopicState;
}

/** Un tema está hecho al aprobar su quiz (≥ 70 %); empezado si se ha abierto o ha salido alguna pregunta. */
export function topicProgress(
  unit: UnitContent,
  cards: Cards,
  topicId: string,
  best: number | undefined,
  read: boolean,
): TopicProgress {
  const boxes = unit.questions.filter((q) => q.topic === topicId).map((q) => cardOf(cards, q.id).box);
  const seen = boxes.filter((box) => box >= 1).length;
  const state: TopicState = (best ?? 0) >= PASS_PERCENT ? 'done' : read || seen > 0 || best !== undefined ? 'started' : 'new';
  return {
    topicId,
    total: boxes.length,
    seen,
    learned: boxes.filter((box) => box >= 2).length,
    best,
    stars: starsFor(best),
    state,
  };
}

export interface UnitSummary {
  total: number;
  seen: number;
  learned: number;
  mastered: number;
  topicsDone: number;
  /** 0–100: preguntas aprendidas sobre el total. */
  percent: number;
}

export function unitSummary(unit: UnitContent, cards: Cards, best: Record<string, number | undefined>): UnitSummary {
  const boxes = unit.questions.map((q) => cardOf(cards, q.id).box);
  const learned = boxes.filter((box) => box >= 2).length;
  return {
    total: boxes.length,
    seen: boxes.filter((box) => box >= 1).length,
    learned,
    mastered: boxes.filter((box) => box >= MAX_BOX).length,
    topicsDone: unit.topics.filter((t) => (best[t.id] ?? 0) >= PASS_PERCENT).length,
    percent: boxes.length === 0 ? 0 : Math.round((learned / boxes.length) * 100),
  };
}
