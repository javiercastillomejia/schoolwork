import { shuffle, type Rng } from '../lib/random';
import type { LearnerProfile } from './profile';
import { cardOf, isDue, type Cards } from './srs';
import type { Question, UnitContent } from './types';

export interface Step {
  questionId: string;
  /** Repetición dentro de la sesión tras un fallo. */
  retry?: boolean;
  /** Fuera del reto: acertar no adelanta el próximo repaso (ver applyFreeAnswer). */
  free?: boolean;
}

/**
 * Qué sesión de preguntas se hace:
 *  - `daily`: el reto de hoy; `more`: seguir después del reto;
 *  - `topic`: el quiz de un tema;
 *  - `mistakes`: repasar fallos (unos concretos o los que más cuestan).
 */
export type SessionRequest =
  | { kind: 'daily' }
  | { kind: 'more' }
  | { kind: 'topic'; topicId: string; all?: boolean }
  | { kind: 'mistakes'; questionIds?: string[] };

export const SESSION_LIMITS = {
  /** Preguntas que pasan antes de repetir una fallada. */
  retryGap: 3,
  /** Veces que se repite una fallada dentro de la misma sesión. */
  maxRetries: 1,
  /** Preguntas de un repaso de fallos. */
  practiceSize: 10,
};

export interface SessionPlan {
  steps: Step[];
  reviewCount: number;
  newCount: number;
  practiceCount: number;
  /** Temas de las preguntas nuevas, sin repetir y en orden. */
  newTopics: string[];
}

/** Preguntas que han salido por primera vez hoy (para el cupo diario de nuevas). */
export function introducedToday(unit: UnitContent, cards: Cards, today: number): number {
  return unit.questions.filter((q) => cards[q.id]?.introduced === today).length;
}

function byUrgency(cards: Cards) {
  return (a: Question, b: Question) => {
    const ca = cardOf(cards, a.id);
    const cb = cardOf(cards, b.id);
    return ca.box - cb.box || ca.due - cb.due || a.id.localeCompare(b.id);
  };
}

/** Repasos pendientes: se eligen los más urgentes y se mezclan. */
function dueReviews(unit: UnitContent, cards: Cards, today: number, profile: LearnerProfile, rng: Rng): Question[] {
  const due = unit.questions.filter((q) => isDue(cardOf(cards, q.id), today)).sort(byUrgency(cards));
  return shuffle(due.slice(0, profile.maxReviews), rng);
}

/**
 * Preguntas que aún no han salido, en el orden del libro; primero las de los
 * temas que ya ha abierto o practicado (lo que se está viendo en clase).
 */
export function unseenInOrder(unit: UnitContent, cards: Cards, startedTopics: string[] = []): Question[] {
  const topicIndex = new Map(unit.topics.map((t, i) => [t.id, i]));
  const started = new Set(startedTopics);
  const rank = (q: Question) => (started.has(q.topic) ? 0 : 1);
  return unit.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => cardOf(cards, q.id).box === 0)
    .sort(
      (a, b) =>
        rank(a.q) - rank(b.q) ||
        (topicIndex.get(a.q.topic) ?? 0) - (topicIndex.get(b.q.topic) ?? 0) ||
        a.i - b.i,
    )
    .map(({ q }) => q);
}

function buildPlan(reviews: Question[], fresh: Question[], practice: Question[]): SessionPlan {
  return {
    steps: [
      ...reviews.map((q) => ({ questionId: q.id })),
      ...fresh.map((q) => ({ questionId: q.id })),
      ...practice.map((q) => ({ questionId: q.id, free: true })),
    ],
    reviewCount: reviews.length,
    newCount: fresh.length,
    practiceCount: practice.length,
    newTopics: [...new Set(fresh.map((q) => q.topic))],
  };
}

/** El reto del día: los repasos pendientes y las preguntas nuevas que tocan hoy (según la edad). */
export function planDaily(
  unit: UnitContent,
  cards: Cards,
  today: number,
  profile: LearnerProfile,
  startedTopics: string[] = [],
  rng: Rng = Math.random,
): SessionPlan {
  const reviews = dueReviews(unit, cards, today, profile, rng);
  const quota = Math.max(0, profile.newPerDay - introducedToday(unit, cards, today));
  const fresh = reviews.length >= profile.maxReviews ? [] : unseenInOrder(unit, cards, startedTopics).slice(0, quota);
  return buildPlan(reviews, fresh, []);
}

/**
 * Para seguir cuando ya ha hecho el reto: más preguntas nuevas sin límite
 * diario. Si ya han salido todas, un repaso extra de las que más cuestan.
 */
export function planMore(
  unit: UnitContent,
  cards: Cards,
  today: number,
  profile: LearnerProfile,
  startedTopics: string[] = [],
  rng: Rng = Math.random,
): SessionPlan {
  const reviews = dueReviews(unit, cards, today, profile, rng);
  const unseen = unseenInOrder(unit, cards, startedTopics);
  if (unseen.length > 0) {
    const fresh = reviews.length >= profile.maxReviews ? [] : unseen.slice(0, profile.newPerDay);
    return buildPlan(reviews, fresh, []);
  }
  const weakest = unit.questions
    .filter((q) => {
      const card = cardOf(cards, q.id);
      return card.box >= 1 && !isDue(card, today);
    })
    .sort(byUrgency(cards))
    .slice(0, Math.max(0, SESSION_LIMITS.practiceSize - reviews.length));
  return buildPlan(reviews, [], shuffle(weakest, rng));
}

/** Las que más cuestan: falladas alguna vez y aún en las primeras cajas. */
export function hardest(unit: UnitContent, cards: Cards): Question[] {
  return unit.questions
    .filter((q) => {
      const card = cardOf(cards, q.id);
      return card.wrong > 0 && card.box <= 2;
    })
    .sort((a, b) => {
      const ca = cardOf(cards, a.id);
      const cb = cardOf(cards, b.id);
      return ca.box - cb.box || cb.wrong - ca.wrong || a.id.localeCompare(b.id);
    });
}

/**
 * Quiz de un tema: `quizLength` preguntas al azar (o todas si hay menos).
 * Con `all`, todas y en orden (p. ej., la hoja de repaso entera).
 */
export function topicSteps(unit: UnitContent, topicId: string, profile: LearnerProfile, rng: Rng = Math.random, all = false): Step[] {
  const pool = unit.questions.filter((q) => q.topic === topicId);
  if (all) return pool.map((q) => ({ questionId: q.id, free: true }));
  const picked = shuffle(pool, rng).slice(0, profile.quizLength);
  // Si el tema tiene pocos ejercicios pero alguno sale con números nuevos, se repiten esos hasta llenar el quiz.
  const generated = shuffle(
    pool.filter((q) => q.kind === 'task' && q.generated),
    rng,
  );
  for (let i = 0; picked.length < profile.quizLength && generated.length > 0; i++) picked.push(generated[i % generated.length]!);
  return picked.map((q) => ({ questionId: q.id, free: true }));
}

/** Repaso de fallos: los indicados o, si no, los que más cuestan. */
export function mistakeSteps(unit: UnitContent, cards: Cards, questionIds: string[] | undefined, rng: Rng = Math.random): Step[] {
  const known = new Set(unit.questions.map((q) => q.id));
  const ids = questionIds?.filter((id) => known.has(id)) ?? hardest(unit, cards).map((q) => q.id);
  return shuffle(ids.slice(0, questionIds ? ids.length : SESSION_LIMITS.practiceSize), rng).map((questionId) => ({
    questionId,
    free: true,
  }));
}

export function stepsFor(
  request: SessionRequest,
  unit: UnitContent,
  cards: Cards,
  today: number,
  profile: LearnerProfile,
  startedTopics: string[] = [],
  rng: Rng = Math.random,
): Step[] {
  switch (request.kind) {
    case 'daily':
      return planDaily(unit, cards, today, profile, startedTopics, rng).steps;
    case 'more':
      return planMore(unit, cards, today, profile, startedTopics, rng).steps;
    case 'topic':
      return topicSteps(unit, request.topicId, profile, rng, request.all);
    case 'mistakes':
      return mistakeSteps(unit, cards, request.questionIds, rng);
  }
}

/** Inserta la repetición de una pregunta fallada unas preguntas más adelante. */
export function scheduleRetry(steps: Step[], index: number, step: Step, retriesSoFar: number): Step[] {
  if (retriesSoFar >= SESSION_LIMITS.maxRetries) return steps;
  const at = Math.min(steps.length, index + 1 + SESSION_LIMITS.retryGap);
  const next = [...steps];
  next.splice(at, 0, { questionId: step.questionId, free: step.free, retry: true });
  return next;
}
