import { describe, expect, it } from 'vitest';
import { parentOf, parseHash, toHash, type Route } from './router';

const base = { subject: 'natural-science', unit: 'unit-2' };

describe('rutas', () => {
  const routes: Route[] = [
    { name: 'hub' },
    { name: 'settings' },
    { name: 'unit', ...base },
    { name: 'topic', ...base, topic: 'char' },
    { name: 'session', ...base, request: { kind: 'topic', topicId: 'nut' } },
    { name: 'session', ...base, request: { kind: 'daily' } },
    { name: 'session', ...base, request: { kind: 'more' } },
    { name: 'session', ...base, request: { kind: 'mistakes' } },
    { name: 'session', ...base, request: { kind: 'mistakes', questionIds: ['char-01', 'nut-02'] } },
    { name: 'exam', ...base },
    { name: 'cards', ...base },
  ];

  it('ida y vuelta', () => {
    for (const route of routes) expect(parseHash(toHash(route))).toEqual(route);
  });

  it('lo desconocido lleva al inicio o a la unidad', () => {
    expect(parseHash('')).toEqual({ name: 'hub' });
    expect(parseHash('#/<script>/x')).toEqual({ name: 'hub' });
    expect(parseHash('#/natural-science/unit-2/nada')).toEqual({ name: 'unit', ...base });
  });

  it('volver desde el quiz de un tema lleva a su ficha', () => {
    expect(parentOf({ name: 'session', ...base, request: { kind: 'topic', topicId: 'nut' } })).toEqual({
      name: 'topic',
      ...base,
      topic: 'nut',
    });
    expect(parentOf({ name: 'cards', ...base })).toEqual({ name: 'unit', ...base });
  });
});
