import { describe, expect, it } from 'vitest';
import { applyAnswer, applyFreeAnswer, dayNumber, isDue, MASTERED_INTERVAL, newCard } from './srs';

const TODAY = 20_000;

describe('cajas de Leitner', () => {
  it('una pregunta nueva acertada pasa a la caja 2 y vuelve mañana', () => {
    const card = applyAnswer(newCard(), true, TODAY);
    expect(card).toMatchObject({ box: 2, due: TODAY + 1, correct: 1, seen: 1, introduced: TODAY });
  });

  it('un fallo devuelve a la caja 1 y toca hoy', () => {
    const card = applyAnswer({ ...newCard(), box: 4, due: TODAY }, false, TODAY);
    expect(card).toMatchObject({ box: 1, due: TODAY, wrong: 1 });
    expect(isDue(card, TODAY)).toBe(true);
  });

  it('los intervalos crecen: 1, 3, 7 y 21 días', () => {
    let card = applyAnswer(newCard(), true, TODAY);
    const gaps = [TODAY + 1];
    for (let i = 0; i < 3; i++) {
      card = applyAnswer(card, true, card.due);
      gaps.push(card.due);
    }
    expect(gaps.map((d, i) => d - (i === 0 ? TODAY : gaps[i - 1]!))).toEqual([1, 3, 7, 21]);
    const again = applyAnswer(card, true, card.due);
    expect(again.box).toBe(5);
    expect(again.due - card.due).toBe(MASTERED_INTERVAL);
  });

  it('practicar antes de tiempo no adelanta el repaso, pero fallar sí cuenta', () => {
    const card = { ...newCard(), box: 3, due: TODAY + 2 };
    expect(applyFreeAnswer(card, true, TODAY)).toMatchObject({ box: 3, due: TODAY + 2, correct: 1 });
    expect(applyFreeAnswer(card, false, TODAY)).toMatchObject({ box: 1, due: TODAY });
  });

  it('fuera del reto, una pregunta nueva o pendiente cuenta como repaso', () => {
    expect(applyFreeAnswer(newCard(), true, TODAY).box).toBe(2);
    expect(applyFreeAnswer({ ...newCard(), box: 2, due: TODAY }, true, TODAY).box).toBe(3);
  });

  it('dayNumber cambia a medianoche local', () => {
    const a = dayNumber(new Date(2026, 10, 21, 0, 1));
    const b = dayNumber(new Date(2026, 10, 21, 23, 59));
    const c = dayNumber(new Date(2026, 10, 22, 0, 1));
    expect(a).toBe(b);
    expect(c).toBe(a + 1);
  });
});
