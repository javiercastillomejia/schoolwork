import { describe, expect, it } from 'vitest';
import { seededRng } from '../lib/random';
import { profileForAge } from './profile';
import { hardVerbs, isHard, pickForReview, practiceSteps, studiedFamilies, studiedVerbs, studiedWeeks } from './review';
import type { Cards } from './session';
import type { CardState } from './srs';
import { VERBS } from '../data/verbs';

const card = (box: number, wrong = 0): CardState => ({ box, due: 0, seen: 2, correct: 1, wrong, lastSeen: 0 });

describe('repaso a su aire', () => {
  it('"me cuesta" son los fallados que aún no están afianzados', () => {
    expect(isHard(card(1, 2))).toBe(true);
    expect(isHard(card(2, 1))).toBe(true);
    expect(isHard(card(4, 3))).toBe(false);
    expect(isHard(card(2, 0))).toBe(false);
    expect(isHard(undefined)).toBe(false);
    expect(hardVerbs({ 1: card(1, 1), 2: card(5, 1), 3: card(2, 0) }).map((v) => v.id)).toEqual([1]);
  });

  it('solo cuenta lo estudiado para semanas y familias', () => {
    const cards: Cards = { 1: card(2), 6: card(3), 9: card(1) };
    expect(studiedVerbs(cards).map((v) => v.id)).toEqual([1, 6, 9]);
    expect(studiedWeeks(cards)).toEqual([1, 2]);
    expect(studiedFamilies(cards)).toEqual(['unique', 'ought']);
  });

  it('da prioridad a los menos afianzados', () => {
    const cards: Cards = { 1: card(5), 2: card(1), 3: card(4), 4: card(2) };
    const verbs = VERBS.filter((v) => v.id <= 4);
    expect(pickForReview(verbs, cards, 2, seededRng(1)).sort()).toEqual([2, 4]);
    expect(pickForReview(verbs, cards, 0, seededRng(1))).toHaveLength(4);
  });

  it('un solo verbo se practica eligiendo y escribiendo', () => {
    expect(practiceSteps([6], 'questions', {}, profileForAge(12))).toEqual([
      { verbId: 6, kind: 'choice', practice: true },
      { verbId: 6, kind: 'write', practice: true },
    ]);
  });

  it('en tarjetas, una por verbo; en preguntas, según la caja', () => {
    expect(practiceSteps([1, 2], 'cards', {}, profileForAge(12)).map((s) => s.kind)).toEqual(['card', 'card']);
    const steps = practiceSteps([1, 2], 'questions', { 1: card(1), 2: card(3) }, profileForAge(12));
    expect(steps.map((s) => s.kind)).toEqual(['choice', 'write']);
  });
});
