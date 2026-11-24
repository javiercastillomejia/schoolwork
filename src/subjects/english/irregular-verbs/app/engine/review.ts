import { VERBS, type FamilyId, type Verb } from '../data/verbs';
import { shuffle, type Rng } from '../lib/random';
import { kindFor, type LearnerProfile } from './profile';
import { cardOf, type Cards, type Step } from './session';
import type { CardState } from './srs';

export type ReviewStyle = 'cards' | 'questions';

/** Verbos ya presentados al menos una vez. */
export function studiedVerbs(cards: Cards): Verb[] {
  return VERBS.filter((verb) => cardOf(cards, verb.id).box >= 1);
}

/** "Me cuesta": lo ha fallado alguna vez y todavía no lo tiene afianzado. */
export function isHard(card: CardState | undefined): boolean {
  return card !== undefined && card.box >= 1 && card.box <= 2 && card.wrong > 0;
}

export function hardVerbs(cards: Cards): Verb[] {
  return VERBS.filter((verb) => isHard(cards[verb.id]));
}

export function studiedWeeks(cards: Cards): number[] {
  return [...new Set(studiedVerbs(cards).map((verb) => verb.week))];
}

export function studiedFamilies(cards: Cards): FamilyId[] {
  return [...new Set(studiedVerbs(cards).map((verb) => verb.family))];
}

/**
 * Elige hasta `count` verbos (0 = todos) dando prioridad a los menos
 * afianzados, y los devuelve mezclados.
 */
export function pickForReview(verbs: Verb[], cards: Cards, count: number, rng: Rng = Math.random): number[] {
  const weakestFirst = shuffle(verbs, rng).sort((a, b) => cardOf(cards, a.id).box - cardOf(cards, b.id).box);
  const chosen = count > 0 ? weakestFirst.slice(0, count) : weakestFirst;
  return shuffle(chosen, rng).map((verb) => verb.id);
}

/**
 * Pasos de un repaso a su aire. En tarjetas, una por verbo. En preguntas, el
 * tipo según la caja; si es un solo verbo ("Practicar este verbo"), una
 * pregunta de elegir y otra de escribir.
 */
export function practiceSteps(verbIds: number[], style: ReviewStyle, cards: Cards, profile: LearnerProfile): Step[] {
  if (style === 'cards') return verbIds.map((verbId) => ({ verbId, kind: 'card', practice: true }));
  if (verbIds.length === 1) {
    const verbId = verbIds[0] as number;
    return [
      { verbId, kind: 'choice', practice: true },
      { verbId, kind: 'write', practice: true },
    ];
  }
  return verbIds.map((verbId) => ({ verbId, kind: kindFor(profile, cardOf(cards, verbId).box), practice: true }));
}
