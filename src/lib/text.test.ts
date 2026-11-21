import { describe, expect, it } from 'vitest';
import { blockSpeech, parseRich, plain } from './text';

describe('texto con negritas', () => {
  it('separa las palabras clave', () => {
    expect(parseRich('They **breathe oxygen** and expel **carbon dioxide**.')).toEqual([
      { text: 'They ', bold: false },
      { text: 'breathe oxygen', bold: true },
      { text: ' and expel ', bold: false },
      { text: 'carbon dioxide', bold: true },
      { text: '.', bold: false },
    ]);
  });

  it('unos asteriscos sin cerrar no rompen nada', () => {
    expect(parseRich('a **b')).toEqual([
      { text: 'a ', bold: false },
      { text: 'b', bold: false },
    ]);
    expect(plain('**Fish** swim')).toBe('Fish swim');
  });

  it('las notas en español no se leen en voz alta', () => {
    expect(blockSpeech({ type: 'note', text: 'Nota' })).toEqual([]);
    expect(blockSpeech({ type: 'pairs', title: 'Senses', items: [['sight', 'eyes']] })).toEqual(['Senses', 'sight: eyes']);
  });
});
