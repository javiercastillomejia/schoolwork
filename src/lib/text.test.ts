import { describe, expect, it } from 'vitest';
import { blockSpeech, parseRich, plain } from './text';

describe('texto con negritas', () => {
  it('separa las palabras clave', () => {
    expect(parseRich('They **breathe oxygen** and expel **carbon dioxide**.')).toEqual([
      { kind: 'text', text: 'They ', bold: false },
      { kind: 'text', text: 'breathe oxygen', bold: true },
      { kind: 'text', text: ' and expel ', bold: false },
      { kind: 'text', text: 'carbon dioxide', bold: true },
      { kind: 'text', text: '.', bold: false },
    ]);
  });

  it('unos asteriscos sin cerrar no rompen nada', () => {
    expect(parseRich('a **b')).toEqual([
      { kind: 'text', text: 'a ', bold: false },
      { kind: 'text', text: 'b', bold: false },
    ]);
    expect(plain('**Fish** swim')).toBe('Fish swim');
  });

  it('las notas en español no se leen en voz alta', () => {
    expect(blockSpeech({ type: 'note', text: 'Nota' })).toEqual([]);
    expect(blockSpeech({ type: 'pairs', title: 'Senses', items: [['sight', 'eyes']] })).toEqual(['Senses', 'sight: eyes']);
  });

  it('fracciones, números mixtos y huecos', () => {
    expect(parseRich('Calcula [3/4] de **[1 1/2]** = [?/8]')).toEqual([
      { kind: 'text', text: 'Calcula ', bold: false },
      { kind: 'frac', whole: null, n: 3, d: 4, bold: false },
      { kind: 'text', text: ' de ', bold: false },
      { kind: 'frac', whole: 1, n: 1, d: 2, bold: true },
      { kind: 'text', text: ' = ', bold: false },
      { kind: 'frac', whole: null, n: null, d: 8, bold: false },
    ]);
    expect(plain('[3/4] de 40', 'es-ES')).toBe('tres cuartos de 40');
    expect(plain('[2 1/2] > [1/3]', 'es-ES')).toBe('dos y un medio es mayor que un tercio');
  });
});

