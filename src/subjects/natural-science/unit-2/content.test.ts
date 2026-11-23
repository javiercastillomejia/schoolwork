import { describe, expect, it } from 'vitest';
import markdown from './CONTENT.md?raw';
import { QUESTIONS, unit2 } from '.';

/** Filas de la tabla que hay justo después de un título de CONTENT.md. */
function tableAfter(title: string): string[][] {
  const lines = markdown.slice(markdown.indexOf(title)).split('\n');
  const start = lines.findIndex((line) => line.startsWith('|'));
  const rows: string[][] = [];
  for (const line of lines.slice(start)) {
    if (!line.startsWith('|')) break;
    rows.push(
      line
        .trim()
        .replace(/^\|\s?|\s?\|$/g, '')
        .split(' | ')
        .map((cell) => cell.trim()),
    );
  }
  return rows.slice(2);
}

describe('Natural Science · Unit 2', () => {
  it('tiene los 10 temas, cada uno con su ficha y sus preguntas', () => {
    expect(unit2.topics.map((t) => t.id)).toEqual([
      'char',
      'nut',
      'int',
      'rep',
      'hum',
      'well',
      'world',
      'story',
      'map',
      'review',
    ]);
    for (const topic of unit2.topics) {
      expect(unit2.study[topic.id]?.length, topic.id).toBeGreaterThan(0);
      expect(unit2.questions.some((q) => q.topic === topic.id), topic.id).toBe(true);
    }
  });

  it('los temas coinciden con la tabla del documento', () => {
    const rows = tableAfter('## Contenido de estudio');
    expect(rows.map(([id, emoji, title, subtitle]) => ({ id, emoji, title, subtitle }))).toEqual(unit2.topics);
  });

  it('tiene las 114 preguntas del documento, sin cambios', () => {
    const rows = tableAfter('## Banco de preguntas');
    expect(rows).toHaveLength(114);
    expect(unit2.questions).toHaveLength(114);
    expect(unit2.questions).toBe(QUESTIONS);
    rows.forEach(([topic, text, correct, wrong, why], i) => {
      const q = QUESTIONS[i]!;
      const single = correct!.endsWith(' (una sola opción)');
      const answer = single ? correct!.replace(' (una sola opción)', '') : correct;
      const distractors = wrong!.split(single ? ' · ' : ' / ');
      expect({ topic: q.topic, text: q.text, options: q.options, why: q.why }).toEqual({
        topic,
        text,
        options: [answer, ...distractors],
        why,
      });
    });
  });

  it('cada pregunta tiene exactamente una respuesta correcta y opciones distintas', () => {
    const ids = new Set<string>();
    for (const q of QUESTIONS) {
      expect(ids.has(q.id), q.id).toBe(false);
      ids.add(q.id);
      expect(q.id.startsWith(`${q.topic}-`)).toBe(true);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size, q.text).toBe(4);
      expect(q.why.length).toBeGreaterThan(0);
    }
  });

  it('tiene los 25 términos del glosario, sin cambios', () => {
    const rows = tableAfter('## Glosario / flashcards');
    expect(rows).toHaveLength(25);
    expect(unit2.glossary.map((g) => [g.word, g.translation, g.definition])).toEqual(rows);
  });
});
