import { VERBS, type Verb } from '../data/verbs';
import { shuffle, type Rng } from '../lib/random';
import { kindFor, profileForAge, type LearnerProfile } from './profile';
import { isDue, newCard, type CardState, type QuestionKind } from './srs';

/** `card`: tarjeta rápida en la que se marca si se sabía o no. */
export type StepKind = 'present' | QuestionKind | 'card';

export interface Step {
  verbId: number;
  kind: StepKind;
  /** Repetición dentro de la sesión tras un fallo. */
  retry?: boolean;
  /** Repaso extra de un verbo al que aún no le tocaba. */
  practice?: boolean;
}

/** `daily`: el reto del día. `more`: lo que se hace después, si quiere seguir. */
export type SessionMode = 'daily' | 'more';

export const SESSION_LIMITS = {
  /** Repasos como máximo por sesión (los más urgentes primero). */
  maxReviews: 20,
  /** Preguntas que pasan antes de repetir un verbo fallado. */
  retryGap: 3,
  /** Veces que se repite un verbo fallado dentro de la misma sesión. */
  maxRetries: 2,
  /** Verbos de un repaso extra cuando ya los conoce todos. */
  practiceSize: 10,
};

export interface SessionPlan {
  mode: SessionMode;
  steps: Step[];
  reviewCount: number;
  newCount: number;
  practiceCount: number;
  /** Semanas a las que pertenecen los verbos nuevos, sin repetir y en orden. */
  newWeeks: number[];
}

export type Cards = Record<number, CardState | undefined>;

export function cardOf(cards: Cards, verbId: number): CardState {
  return cards[verbId] ?? newCard();
}

/** Verbos presentados hoy (para no pasarse del cupo diario de nuevos). */
export function introducedToday(cards: Cards, today: number): number {
  return VERBS.filter((verb) => cards[verb.id]?.introduced === today).length;
}

/** Repasos pendientes: se eligen los más urgentes y se mezclan. */
function dueReviews(cards: Cards, today: number, profile: LearnerProfile, rng: Rng): Step[] {
  const due = VERBS.filter((verb) => isDue(cardOf(cards, verb.id), today))
    .sort((a, b) => {
      const ca = cardOf(cards, a.id);
      const cb = cardOf(cards, b.id);
      return ca.box - cb.box || ca.due - cb.due || a.id - b.id;
    })
    .slice(0, SESSION_LIMITS.maxReviews);
  return shuffle(due, rng).map((verb) => ({ verbId: verb.id, kind: kindFor(profile, cardOf(cards, verb.id).box) }));
}

/** Los verbos nuevos se presentan de dos en dos y se preguntan justo después. */
export function introductionSteps(verbs: Verb[], profile: LearnerProfile): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < verbs.length; i += 2) {
    const batch = verbs.slice(i, i + 2);
    for (const verb of batch) steps.push({ verbId: verb.id, kind: 'present' });
    for (const verb of batch) steps.push({ verbId: verb.id, kind: kindFor(profile, 1) });
  }
  return steps;
}

/** Orden de los verbos por ver: la semana de clase, luego las anteriores y después las siguientes. */
function unseenInOrder(cards: Cards, currentWeek: number): Verb[] {
  const rank = (verb: Verb) => (verb.week === currentWeek ? 0 : verb.week < currentWeek ? 1 : 2);
  return VERBS.filter((verb) => cardOf(cards, verb.id).box === 0).sort((a, b) => rank(a) - rank(b) || a.id - b.id);
}

function buildPlan(mode: SessionMode, reviews: Step[], newVerbs: Verb[], practice: Step[], profile: LearnerProfile): SessionPlan {
  return {
    mode,
    steps: [...reviews, ...introductionSteps(newVerbs, profile), ...practice],
    reviewCount: reviews.length,
    newCount: newVerbs.length,
    practiceCount: practice.length,
    newWeeks: [...new Set(newVerbs.map((verb) => verb.week))].sort((a, b) => a - b),
  };
}

/**
 * El reto del día: los repasos pendientes y los verbos nuevos que tocan hoy
 * (cuántos depende de la edad), solo hasta la semana de clase.
 */
export function planDaily(
  cards: Cards,
  currentWeek: number,
  today: number,
  profile: LearnerProfile = profileForAge(null),
  rng: Rng = Math.random,
): SessionPlan {
  const reviews = dueReviews(cards, today, profile, rng);
  const quota = Math.max(0, profile.newPerSession - introducedToday(cards, today));
  const unseen = unseenInOrder(cards, currentWeek).filter((verb) => verb.week <= currentWeek);
  const newVerbs = reviews.length >= SESSION_LIMITS.maxReviews ? [] : unseen.slice(0, quota);
  return buildPlan('daily', reviews, newVerbs, [], profile);
}

/**
 * Para seguir cuando ya ha hecho el reto: más verbos nuevos sin límite diario,
 * avanzando semana a semana aunque vaya por delante de clase. Si ya los ha
 * visto todos, un repaso extra de los que más le cuestan.
 */
export function planMore(
  cards: Cards,
  currentWeek: number,
  today: number,
  profile: LearnerProfile = profileForAge(null),
  rng: Rng = Math.random,
): SessionPlan {
  const reviews = dueReviews(cards, today, profile, rng);
  const unseen = unseenInOrder(cards, currentWeek);
  if (unseen.length > 0) {
    const newVerbs = reviews.length >= SESSION_LIMITS.maxReviews ? [] : unseen.slice(0, profile.newPerSession);
    return buildPlan('more', reviews, newVerbs, [], profile);
  }
  const weakest = VERBS.filter((verb) => {
    const card = cardOf(cards, verb.id);
    return card.box >= 1 && !isDue(card, today);
  })
    .sort((a, b) => {
      const ca = cardOf(cards, a.id);
      const cb = cardOf(cards, b.id);
      return ca.box - cb.box || ca.due - cb.due || a.id - b.id;
    })
    .slice(0, Math.max(0, SESSION_LIMITS.practiceSize - reviews.length));
  const practice = shuffle(weakest, rng).map((verb) => ({
    verbId: verb.id,
    kind: kindFor(profile, cardOf(cards, verb.id).box),
    practice: true,
  }));
  return buildPlan('more', reviews, [], practice, profile);
}

export function planFor(
  mode: SessionMode,
  cards: Cards,
  currentWeek: number,
  today: number,
  profile: LearnerProfile,
  rng: Rng = Math.random,
): SessionPlan {
  return mode === 'daily'
    ? planDaily(cards, currentWeek, today, profile, rng)
    : planMore(cards, currentWeek, today, profile, rng);
}

/** Inserta la repetición de un verbo fallado unas preguntas más adelante. */
export function scheduleRetry(steps: Step[], index: number, step: Step, retriesSoFar: number): Step[] {
  if (step.kind === 'present' || retriesSoFar >= SESSION_LIMITS.maxRetries) return steps;
  const at = Math.min(steps.length, index + 1 + SESSION_LIMITS.retryGap);
  const next = [...steps];
  next.splice(at, 0, { verbId: step.verbId, kind: step.kind, retry: true });
  return next;
}
