import { describe, expect, it } from 'vitest';
import { seededRng } from '../lib/random';
import { unit2 } from '../subjects/natural-science/unit-2';
import { profileForAge } from './profile';
import {
  hardest,
  mistakeSteps,
  planDaily,
  planMore,
  scheduleRetry,
  SESSION_LIMITS,
  topicSteps,
  unseenInOrder,
} from './session';
import { newCard, type Cards } from './srs';

const TODAY = 20_000;
const nine = profileForAge(9);

describe('reto del día', () => {
  it('el primer día salen las preguntas nuevas del primer tema, según la edad', () => {
    const plan = planDaily(unit2, {}, TODAY, nine, [], seededRng(1));
    expect(plan.newCount).toBe(nine.newPerDay);
    expect(plan.reviewCount).toBe(0);
    expect(plan.steps.map((s) => s.questionId)).toEqual(['char-01', 'char-02', 'char-03', 'char-04', 'char-05', 'char-06']);
    expect(plan.newTopics).toEqual(['char']);
  });

  it('a los 7 años salen menos nuevas que a los 13', () => {
    expect(planDaily(unit2, {}, TODAY, profileForAge(7)).newCount).toBeLessThan(
      planDaily(unit2, {}, TODAY, profileForAge(13)).newCount,
    );
  });

  it('primero las preguntas de los temas que ya ha abierto', () => {
    const plan = planDaily(unit2, {}, TODAY, nine, ['rep']);
    expect(plan.steps[0]?.questionId).toBe('rep-01');
    expect(plan.newTopics).toEqual(['rep']);
  });

  it('no se pasa del cupo de nuevas del día', () => {
    const cards: Cards = {};
    for (const id of ['char-01', 'char-02', 'char-03', 'char-04']) cards[id] = { ...newCard(), box: 2, due: TODAY + 1, introduced: TODAY };
    expect(planDaily(unit2, cards, TODAY, nine).newCount).toBe(nine.newPerDay - 4);
  });

  it('los repasos pendientes van antes que las nuevas y como mucho maxReviews', () => {
    const cards: Cards = {};
    unit2.questions.slice(0, 30).forEach((q) => (cards[q.id] = { ...newCard(), box: 2, due: TODAY - 1 }));
    const plan = planDaily(unit2, cards, TODAY, nine);
    expect(plan.reviewCount).toBe(nine.maxReviews);
    expect(plan.newCount).toBe(0);
  });

  it('cuando ya han salido todas, "quiero más" repasa las que más cuestan', () => {
    const cards: Cards = {};
    unit2.questions.forEach((q, i) => (cards[q.id] = { ...newCard(), box: i % 5 === 0 ? 1 : 4, due: TODAY + 3 }));
    const plan = planMore(unit2, cards, TODAY, nine, [], seededRng(3));
    expect(plan.newCount).toBe(0);
    expect(plan.practiceCount).toBe(SESSION_LIMITS.practiceSize);
    expect(plan.steps.every((s) => s.free && cards[s.questionId]!.box === 1)).toBe(true);
  });

  it('unseenInOrder respeta el orden del libro', () => {
    const order = unseenInOrder(unit2, {}).map((q) => q.topic);
    const firstOf = (topic: string) => order.indexOf(topic);
    expect(firstOf('char')).toBeLessThan(firstOf('nut'));
    expect(firstOf('map')).toBeLessThan(firstOf('review'));
  });
});

describe('quiz de un tema y repaso de fallos', () => {
  it('10 preguntas al azar del tema (o todas si hay menos)', () => {
    const steps = topicSteps(unit2, 'char', nine, seededRng(5));
    expect(steps).toHaveLength(10);
    expect(new Set(steps.map((s) => s.questionId)).size).toBe(10);
    expect(steps.every((s) => s.questionId.startsWith('char-') && s.free)).toBe(true);
    expect(topicSteps(unit2, 'map', nine)).toHaveLength(6);
    expect(topicSteps(unit2, 'char', profileForAge(7))).toHaveLength(8);
  });

  it('hardest: falladas y en las primeras cajas, las peores primero', () => {
    const cards: Cards = {
      'nut-01': { ...newCard(), box: 1, wrong: 1 },
      'nut-02': { ...newCard(), box: 1, wrong: 3 },
      'nut-03': { ...newCard(), box: 4, wrong: 2 },
    };
    expect(hardest(unit2, cards).map((q) => q.id)).toEqual(['nut-02', 'nut-01']);
  });

  it('mistakeSteps usa las indicadas e ignora ids desconocidos', () => {
    const steps = mistakeSteps(unit2, {}, ['nut-01', 'zzz-99', 'rep-03']);
    expect(steps.map((s) => s.questionId).sort()).toEqual(['nut-01', 'rep-03']);
  });

  it('una fallada se repite 3 preguntas después, una sola vez', () => {
    const steps = ['a', 'b', 'c', 'd', 'e'].map((questionId) => ({ questionId }));
    const once = scheduleRetry(steps, 0, steps[0]!, 0);
    expect(once.map((s) => s.questionId)).toEqual(['a', 'b', 'c', 'd', 'a', 'e']);
    expect(once[4]?.retry).toBe(true);
    expect(scheduleRetry(once, 4, once[4]!, 1)).toBe(once);
  });
});
