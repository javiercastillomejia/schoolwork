import { describe, expect, it } from 'vitest';
import { seededRng } from '../lib/random';
import { profileForAge } from './profile';
import { SESSION_LIMITS, introducedToday, planDaily, planMore, scheduleRetry, type Cards, type Step } from './session';
import { applyPracticeAnswer, type CardState } from './srs';

const TODAY = 20_000;
const TWELVE = profileForAge(12);
const card = (box: number, due: number, introduced?: number): CardState => ({
  box,
  due,
  seen: 1,
  correct: 0,
  wrong: 0,
  lastSeen: TODAY - 1,
  introduced,
});
const ids = (steps: Step[], kind: Step['kind']) => steps.filter((s) => s.kind === kind).map((s) => s.verbId);

/** Todos los verbos de las semanas indicadas ya vistos y sin repaso pendiente. */
function seenWeeks(...weeks: number[]): Cards {
  const cards: Cards = {};
  for (const week of weeks) for (let id = week * 7 - 6; id <= Math.min(week * 7, 74); id++) cards[id] = card(2, TODAY + 1);
  return cards;
}

describe('planDaily: el reto del día', () => {
  it('sin progreso presenta 4 verbos de la semana 1, de dos en dos', () => {
    const plan = planDaily({}, 1, TODAY, TWELVE, seededRng(1));
    expect(plan).toMatchObject({ mode: 'daily', reviewCount: 0, newCount: 4, newWeeks: [1] });
    expect(plan.steps.map((s) => `${s.kind}:${s.verbId}`)).toEqual([
      'present:1',
      'present:2',
      'choice:1',
      'choice:2',
      'present:3',
      'present:4',
      'choice:3',
      'choice:4',
    ]);
  });

  it('pone primero los repasos pendientes y los pregunta según su caja', () => {
    const cards: Cards = { 1: card(1, TODAY), 2: card(3, TODAY - 2), 3: card(2, TODAY + 1) };
    const plan = planDaily(cards, 1, TODAY, TWELVE, seededRng(1));
    expect(plan.reviewCount).toBe(2);
    expect(plan.steps.slice(0, 2)).toEqual(
      expect.arrayContaining([
        { verbId: 1, kind: 'choice' },
        { verbId: 2, kind: 'write' },
      ]),
    );
    expect(plan.steps.some((s) => s.verbId === 3)).toBe(false);
    expect(ids(plan.steps, 'present')).toEqual([4, 5, 6, 7]);
  });

  it('presenta antes los verbos de la semana actual que los de semanas anteriores', () => {
    expect(ids(planDaily({}, 3, TODAY, TWELVE, seededRng(1)).steps, 'present')).toEqual([15, 16, 17, 18]);
  });

  it('no mete verbos de semanas futuras', () => {
    expect(planDaily(seenWeeks(1), 1, TODAY, TWELVE, seededRng(1)).steps).toHaveLength(0);
  });

  it('respeta el cupo diario de verbos nuevos', () => {
    const cards: Cards = { 1: card(2, TODAY + 1, TODAY), 2: card(2, TODAY + 1, TODAY), 3: card(2, TODAY + 1, TODAY) };
    expect(introducedToday(cards, TODAY)).toBe(3);
    expect(ids(planDaily(cards, 1, TODAY, TWELVE, seededRng(1)).steps, 'present')).toEqual([4]);
    // Al día siguiente el cupo vuelve a estar completo.
    expect(planDaily(cards, 1, TODAY + 1, TWELVE, seededRng(1)).newCount).toBe(4);
  });

  it('si hay muchos repasos atrasados no añade verbos nuevos', () => {
    const cards: Cards = {};
    for (let id = 1; id <= 30; id++) cards[id] = card(2, TODAY - 1);
    const plan = planDaily(cards, 6, TODAY, TWELVE, seededRng(1));
    expect(plan.reviewCount).toBe(SESSION_LIMITS.maxReviews);
    expect(plan.newCount).toBe(0);
  });

  it('con 9 años presenta 3 verbos nuevos y pregunta eligiendo', () => {
    const plan = planDaily({}, 1, TODAY, profileForAge(9), seededRng(1));
    expect(plan.newCount).toBe(3);
    expect(plan.steps.filter((s) => s.kind !== 'present').every((s) => s.kind === 'choice')).toBe(true);
  });

  it('con 15 años escribe desde el principio', () => {
    const plan = planDaily({}, 1, TODAY, profileForAge(15), seededRng(1));
    expect(plan.steps.filter((s) => s.kind !== 'present').every((s) => s.kind === 'write')).toBe(true);
  });

  it('con 9 años un verbo en la caja 2 se sigue preguntando eligiendo', () => {
    const plan = planDaily({ 1: card(2, TODAY) }, 1, TODAY, profileForAge(9), seededRng(1));
    expect(plan.steps[0]).toEqual({ verbId: 1, kind: 'choice' });
  });
});

describe('planMore: seguir aprendiendo después del reto', () => {
  it('sigue con la semana siguiente aunque vaya por delante de clase', () => {
    const plan = planMore(seenWeeks(1), 1, TODAY, TWELVE, seededRng(1));
    expect(plan).toMatchObject({ mode: 'more', newCount: 4, newWeeks: [2], practiceCount: 0 });
    expect(ids(plan.steps, 'present')).toEqual([8, 9, 10, 11]);
  });

  it('no tiene cupo diario: aunque hoy ya haya visto verbos nuevos, sigue', () => {
    const cards: Cards = {};
    for (let id = 1; id <= 7; id++) cards[id] = card(2, TODAY + 1, TODAY);
    expect(planDaily(cards, 1, TODAY, TWELVE, seededRng(1)).steps).toHaveLength(0);
    expect(planMore(cards, 1, TODAY, TWELVE, seededRng(1)).newCount).toBe(4);
  });

  it('termina primero la semana de clase y puede juntar dos semanas', () => {
    const cards = seenWeeks(1);
    cards[7] = undefined;
    cards[6] = undefined;
    const plan = planMore(cards, 1, TODAY, TWELVE, seededRng(1));
    expect(ids(plan.steps, 'present')).toEqual([6, 7, 8, 9]);
    expect(plan.newWeeks).toEqual([1, 2]);
  });

  it('va en orden: semana de clase, las anteriores que falten y luego las siguientes', () => {
    const cards = seenWeeks(3);
    cards[1] = card(2, TODAY + 1);
    cards[2] = card(2, TODAY + 1);
    const plan = planMore(cards, 3, TODAY, TWELVE, seededRng(1));
    expect(ids(plan.steps, 'present')).toEqual([3, 4, 5, 6]);
  });

  it('incluye los repasos que queden pendientes', () => {
    const cards = seenWeeks(1);
    cards[2] = card(1, TODAY);
    const plan = planMore(cards, 1, TODAY, TWELVE, seededRng(1));
    expect(plan.steps[0]).toEqual({ verbId: 2, kind: 'choice' });
    expect(plan.newCount).toBe(4);
  });

  it('cuando ya los conoce todos, hace un repaso extra de los que más le cuestan', () => {
    const cards: Cards = {};
    for (let id = 1; id <= 74; id++) cards[id] = card(id <= 5 ? 2 : 5, TODAY + 10);
    const plan = planMore(cards, 11, TODAY, TWELVE, seededRng(1));
    expect(plan).toMatchObject({ newCount: 0, reviewCount: 0, practiceCount: SESSION_LIMITS.practiceSize });
    expect(plan.steps.every((s) => s.practice)).toBe(true);
    // Los cinco de la caja 2 son los primeros en entrar.
    expect(plan.steps.map((s) => s.verbId)).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });
});

describe('repaso extra', () => {
  it('un acierto no adelanta el próximo repaso; un fallo sí cuenta', () => {
    const before = card(3, TODAY + 3);
    const right = applyPracticeAnswer(before, true, TODAY);
    expect(right).toMatchObject({ box: 3, due: TODAY + 3, correct: 1 });
    const wrong = applyPracticeAnswer(before, false, TODAY);
    expect(wrong).toMatchObject({ box: 1, due: TODAY });
  });
});

describe('scheduleRetry', () => {
  it('repite el verbo fallado unas preguntas después', () => {
    const steps = [1, 2, 3, 4, 5, 6].map((verbId) => ({ verbId, kind: 'write' as const }));
    const next = scheduleRetry(steps, 0, steps[0]!, 0);
    expect(next[1 + SESSION_LIMITS.retryGap]).toEqual({ verbId: 1, kind: 'write', retry: true });
  });

  it('un fallo en un repaso extra se repite como repaso normal', () => {
    const steps: Step[] = [{ verbId: 9, kind: 'write', practice: true }];
    expect(scheduleRetry(steps, 0, steps[0]!, 0)[1]).toEqual({ verbId: 9, kind: 'write', retry: true });
  });

  it('si es la última pregunta, la repite al final', () => {
    const steps = [{ verbId: 9, kind: 'choice' as const }];
    expect(scheduleRetry(steps, 0, steps[0]!, 0)).toHaveLength(2);
  });

  it('no repite más de lo permitido', () => {
    const steps = [{ verbId: 9, kind: 'choice' as const }];
    expect(scheduleRetry(steps, 0, steps[0]!, SESSION_LIMITS.maxRetries)).toBe(steps);
  });
});
