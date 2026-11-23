import { describe, expect, it } from 'vitest';
import { denominatorWord, equivalent, fractionWords, gcd, numberWords, numText, simplest } from './frac';

describe('fracciones', () => {
  it('mcd, simplificar y equivalentes', () => {
    expect(gcd(24, 48)).toBe(24);
    expect(simplest([16, 24])).toEqual([2, 3]);
    expect(equivalent([4, 8], [1, 2])).toBe(true);
    expect(equivalent([2, 5], [4, 8])).toBe(false);
  });

  it('se leen como en el libro', () => {
    expect(fractionWords([1, 2])).toBe('un medio');
    expect(fractionWords([3, 4])).toBe('tres cuartos');
    expect(fractionWords([3, 10])).toBe('tres décimos');
    expect(fractionWords([4, 100])).toBe('cuatro centésimos');
    expect(fractionWords([1, 18])).toBe('un dieciochoavo');
    expect(denominatorWord(11)).toBe('onceavo');
    expect(denominatorWord(12)).toBe('doceavo');
    expect(denominatorWord(24)).toBe('veinticuatroavo');
    expect(fractionWords([13, 6])).toBe('trece sextos');
  });

  it('números en palabras y con coma', () => {
    expect(numberWords(21)).toBe('veintiuno');
    expect(numberWords(45)).toBe('cuarenta y cinco');
    expect(numberWords(186)).toBe('ciento ochenta y seis');
    expect(numberWords(4000)).toBe('cuatro mil');
    expect(numText(0.25)).toBe('0,25');
    expect(numText(333.333)).toBe('333,333');
    expect(numText(15)).toBe('15');
  });
});
