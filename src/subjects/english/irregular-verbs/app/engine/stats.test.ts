import { describe, expect, it } from 'vitest';
import { profileForAge, kindFor } from './profile';
import type { Cards } from './session';
import type { CardState } from './srs';
import { currentStreak, pathReach, sessionStars, weekNodeState, weekProgress } from './stats';

const card = (box: number): CardState => ({ box, due: 0, seen: 1, correct: 1, wrong: 0, lastSeen: 0 });

describe('racha', () => {
  it('cuenta los días seguidos hasta hoy', () => {
    expect(currentStreak([7, 8, 9, 10], 10)).toBe(4);
  });
  it('si hoy aún no ha estudiado, cuenta hasta ayer', () => {
    expect(currentStreak([8, 9], 10)).toBe(2);
  });
  it('se rompe si falta un día', () => {
    expect(currentStreak([5, 6, 8], 10)).toBe(0);
    expect(currentStreak([5, 6, 9, 10], 10)).toBe(2);
  });
});

describe('estrellas de la sesión', () => {
  it('da 3, 2 o 1 estrellas según los aciertos a la primera', () => {
    expect(sessionStars(9, 10)).toBe(3);
    expect(sessionStars(7, 10)).toBe(2);
    expect(sessionStars(2, 10)).toBe(1);
    expect(sessionStars(0, 0)).toBe(0);
  });
});

describe('progreso de una semana', () => {
  it('sin empezar no tiene estrellas', () => {
    expect(weekProgress({}, 1)).toEqual({ week: 1, total: 7, started: 0, learned: 0, stars: 0 });
  });
  it('gana estrellas según lo afianzados que estén sus verbos', () => {
    const cards: Cards = {};
    for (let id = 1; id <= 7; id++) cards[id] = card(2);
    expect(weekProgress(cards, 1).stars).toBe(1);
    for (let id = 1; id <= 7; id++) cards[id] = card(3);
    expect(weekProgress(cards, 1).stars).toBe(2);
    for (let id = 1; id <= 7; id++) cards[id] = card(5);
    expect(weekProgress(cards, 1).stars).toBe(3);
    cards[7] = card(1);
    expect(weekProgress(cards, 1)).toMatchObject({ learned: 6, stars: 0 });
  });
});

describe('perfil por edad', () => {
  it('los más pequeños eligen más tiempo y tienen pista', () => {
    const p = profileForAge(9);
    expect(p).toMatchObject({ newPerSession: 3, firstLetterHint: true });
    expect(kindFor(p, 2)).toBe('choice');
    expect(kindFor(p, 3)).toBe('write');
  });
  it('de 11 a 13 se elige solo en la caja 1', () => {
    const p = profileForAge(12);
    expect(kindFor(p, 1)).toBe('choice');
    expect(kindFor(p, 2)).toBe('write');
  });
  it('desde 14 se escribe siempre', () => {
    expect(kindFor(profileForAge(15), 1)).toBe('write');
  });
  it('sin edad usa el perfil de 12 años', () => {
    expect(profileForAge(null)).toEqual(profileForAge(12));
  });
});

describe('estado de cada semana en el camino', () => {
  it('una semana futura empezada por adelantado queda abierta y el camino llega hasta ella', () => {
    const cards: Cards = { 15: card(2), 16: card(1) };
    expect(weekNodeState(weekProgress(cards, 3), 1)).toBe('open');
    expect(weekNodeState(weekProgress(cards, 4), 1)).toBe('locked');
    expect(weekNodeState(weekProgress({}, 11), 1)).toBe('goal');
    expect(weekNodeState(weekProgress({}, 1), 1)).toBe('current');
    expect(pathReach(cards, 1)).toBe(3);
    expect(pathReach({}, 2)).toBe(2);
  });
});
