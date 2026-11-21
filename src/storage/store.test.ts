import { describe, expect, it } from 'vitest';
import { cleanName, emptyStore, markStudied, needsProfile, parseStore, unitKey, updateUnit } from './store';

describe('guardado', () => {
  it('sin datos o con datos rotos empieza de cero', () => {
    expect(parseStore(null)).toEqual(emptyStore());
    expect(parseStore('{no es json')).toEqual(emptyStore());
    expect(parseStore('{"version":7}')).toEqual(emptyStore());
  });

  it('limpia lo guardado: edad dentro de rango, tarjetas válidas, notas entre 0 y 100', () => {
    const store = parseStore(
      JSON.stringify({
        version: 1,
        settings: { name: '  Eva  ', age: 40, autoSpeak: 'yes' },
        studyDays: [1, 'x', 2],
        units: {
          'natural-science/unit-2': {
            cards: { 'char-01': { box: 9, due: 5 }, 'char-02': { box: 'x' } },
            best: { char: 120, nut: 'mal' },
            exams: [{ grade: 8, percent: 80, day: 3 }, { grade: 'x' }],
            read: ['char', 3],
            rewards: -2,
          },
        },
      }),
    );
    expect(store.settings).toEqual({ name: 'Eva', age: 15, autoSpeak: false });
    expect(store.studyDays).toEqual([1, 2]);
    const unit = store.units['natural-science/unit-2']!;
    expect(unit.cards['char-01']).toMatchObject({ box: 5, due: 5, seen: 0 });
    expect(unit.cards['char-02']).toBeUndefined();
    expect(unit.best).toEqual({ char: 100 });
    expect(unit.exams).toHaveLength(1);
    expect(unit.read).toEqual(['char']);
    expect(unit.rewards).toBe(0);
  });

  it('perfil: hace falta nombre y edad', () => {
    expect(needsProfile({ name: '', age: 9, autoSpeak: false })).toBe(true);
    expect(needsProfile({ name: 'Eva', age: null, autoSpeak: false })).toBe(true);
    expect(needsProfile({ name: 'Eva', age: 9, autoSpeak: false })).toBe(false);
    expect(cleanName('  eva   maría ')).toBe('eva maría');
  });

  it('updateUnit y markStudied no tocan lo demás', () => {
    const key = unitKey('natural-science', 'unit-2');
    let store = updateUnit(emptyStore(), key, (u) => ({ ...u, rewards: 3 }));
    store = markStudied(markStudied(store, 10), 10);
    expect(store.units[key]?.rewards).toBe(3);
    expect(store.studyDays).toEqual([10]);
  });
});
