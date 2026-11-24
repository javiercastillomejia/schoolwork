import { describe, expect, it } from 'vitest';
import { MASTERED_INTERVAL, applyAnswer, dayNumber, introduce, isDue, newCard } from './srs';

const TODAY = 20_000;

describe('cajas de Leitner', () => {
  it('un verbo nuevo entra en la caja 1 al presentarlo', () => {
    const card = introduce(newCard(), TODAY);
    expect(card.box).toBe(1);
    expect(isDue(card, TODAY)).toBe(true);
  });

  it('al acertar sube de caja y espera 1, 3, 7 y 21 días', () => {
    let card = introduce(newCard(), TODAY);
    const waits: number[] = [];
    for (let i = 0; i < 4; i++) {
      card = applyAnswer(card, true, TODAY);
      waits.push(card.due - TODAY);
    }
    expect(card.box).toBe(5);
    expect(waits).toEqual([1, 3, 7, 21]);
    card = applyAnswer(card, true, TODAY);
    expect(card.box).toBe(5);
    expect(card.due - TODAY).toBe(MASTERED_INTERVAL);
  });

  it('al fallar vuelve a la caja 1 y toca repasarlo hoy', () => {
    let card = introduce(newCard(), TODAY);
    card = applyAnswer(card, true, TODAY);
    card = applyAnswer(card, true, TODAY);
    card = applyAnswer(card, false, TODAY);
    expect(card.box).toBe(1);
    expect(card.due).toBe(TODAY);
    expect(card.wrong).toBe(1);
    expect(card.correct).toBe(2);
  });

  it('dayNumber cambia a medianoche local', () => {
    const night = new Date(2026, 10, 18, 23, 59);
    const morning = new Date(2026, 10, 19, 0, 1);
    expect(dayNumber(morning) - dayNumber(night)).toBe(1);
  });
});
