import { afterEach, describe, expect, it } from 'vitest';
import { addExam, cleanName, emptyProgress, lastExam, loadProgress, needsProfile } from './progress';

const store = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  },
};

afterEach(() => store.clear());

describe('progreso guardado', () => {
  it('quien empezó antes de preguntar nombre y edad conserva su progreso y se le pregunta', () => {
    store.set(
      'verbos-irregulares:v1',
      JSON.stringify({
        version: 1,
        cards: { 1: { box: 3, due: 5, seen: 2, correct: 2, wrong: 0, lastSeen: 4 } },
        settings: { currentWeek: 2, autoSpeak: false, onboarded: true },
        studyDays: [4],
      }),
    );
    const progress = loadProgress();
    expect(progress.cards[1]?.box).toBe(3);
    expect(progress.settings).toMatchObject({ currentWeek: 2, autoSpeak: false, onboarded: true, name: '', age: null });
    expect(progress.stars).toBe(0);
    expect(needsProfile(progress.settings)).toBe(true);
  });

  it('limita la edad y limpia el nombre', () => {
    store.set(
      'verbos-irregulares:v1',
      JSON.stringify({ ...emptyProgress(), settings: { ...emptyProgress().settings, name: '  Ana   María ', age: 30 } }),
    );
    const { settings } = loadProgress();
    expect(settings.name).toBe('Ana María');
    expect(settings.age).toBe(16);
    expect(needsProfile(settings)).toBe(false);
  });

  it('cleanName recorta nombres muy largos', () => {
    expect(cleanName('x'.repeat(40))).toHaveLength(24);
  });
});

describe('historial de exámenes', () => {
  it('guarda las notas y recupera la última de cada examen', () => {
    let exams = addExam([], { key: 'w1', grade: 7.1, day: 1 });
    exams = addExam(exams, { key: 'all', grade: 6, day: 2 });
    exams = addExam(exams, { key: 'w1', grade: 8.6, day: 3 });
    expect(lastExam(exams, 'w1')?.grade).toBe(8.6);
    expect(lastExam(exams, 'w2')).toBeUndefined();
  });

  it('el progreso guardado antes sin exámenes se carga con la lista vacía', () => {
    store.set('verbos-irregulares:v1', JSON.stringify({ version: 1, cards: {}, settings: {}, studyDays: [] }));
    expect(loadProgress().exams).toEqual([]);
  });
});
