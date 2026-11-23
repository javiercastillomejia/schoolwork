/**
 * Piezas para escribir los ejercicios de fracciones: azar, casillas y
 * explicaciones. Las soluciones se calculan aquí a partir de los datos del
 * enunciado (no se escriben a mano), así no puede colarse una errata.
 */
import type { Body, Expect, Field, Shape, Task } from '../../../core/task';
import type { TaskQuestion } from '../../../core/types';
import { f, gcd, lcm, numText, type Frac } from '../../../lib/frac';
import { pick, shuffle, type Rng } from '../../../lib/random';

export { f, gcd, lcm, numText, pick, shuffle };
export type { Frac, Rng };

/** Entero al azar entre a y b (ambos incluidos). */
export function int(rng: Rng, a: number, b: number): number {
  return a + Math.floor(rng() * (b - a + 1));
}

/** Fracción en su forma más simple con denominador entre 2 y `maxD`. */
export function simpleFrac(rng: Rng, maxD = 6, proper = true): Frac {
  for (;;) {
    const d = int(rng, 2, maxD);
    const n = proper ? int(rng, 1, d - 1) : int(rng, 1, 2 * d);
    if (gcd(n, d) === 1) return [n, d];
  }
}

export const num = (value: number, unit?: string): Expect => ({ type: 'number', value, ...(unit ? { unit } : {}) });
export const frac = ([n, d]: Frac, mode: 'exact' | 'equivalent' | 'amplify' | 'simplify' = 'equivalent'): Expect => ({
  type: 'fraction',
  n,
  d,
  mode,
});
export const mixed = ([n, d]: Frac): Expect => ({ type: 'mixed', whole: Math.floor(n / d), n: n % d, d });

export function field(label: string | undefined, expect: Expect): Field {
  return label ? { label, expect } : { expect };
}

/** [n/d] de q */
export function ofQty([n, d]: Frac, q: number): number {
  return Math.round(((q / d) * n) * 1000) / 1000;
}

/** "30 : 2 = 15 → 15 × 1 = 15" */
export function ofQtyWhy([n, d]: Frac, q: number): string {
  const part = Math.round((q / d) * 1000) / 1000;
  return n === 1
    ? `${numText(q)} : ${d} = ${numText(part)}`
    : `${numText(q)} : ${d} = ${numText(part)} → ${numText(part)} × ${n} = ${numText(ofQty([n, d], q))}`;
}

/** [7/2] = [3 1/2] */
export function mixedText([n, d]: Frac): string {
  const w = Math.floor(n / d);
  const r = n % d;
  return r === 0 ? String(w) : `[${w} ${r}/${d}]`;
}

/** Explicación de pasar a número mixto. */
export function mixedWhy([n, d]: Frac): string {
  const w = Math.floor(n / d);
  const r = n % d;
  return `${n} : ${d} = ${w} y sobran ${r}. Son ${w} ${w === 1 ? 'entero' : 'enteros'} y ${f([r, d])}: ${f([n, d])} = ${mixedText([n, d])}.`;
}

export type Kind = 'propia' | 'impropia' | 'unidad';

export function kindOf([n, d]: Frac): Kind {
  return n < d ? 'propia' : n > d ? 'impropia' : 'unidad';
}

/** Comparar dos fracciones: '<', '=' o '>'. */
export function compare([a, b]: Frac, [c, d]: Frac): '<' | '=' | '>' {
  const x = a * d - c * b;
  return x < 0 ? '<' : x > 0 ? '>' : '=';
}

export const SIGNS = ['<', '=', '>'];

/** Fila de comparar: "[a/b] ○ [c/d]" (también con enteros: "[7/3] ○ 2"). */
export function compareRow(left: Frac, right: Frac, rightText?: string) {
  return {
    label: `${f(left)} ○ ${rightText ?? f(right)}`,
    options: SIGNS,
    answer: SIGNS.indexOf(compare(left, right)),
  };
}

/** Por qué una comparación sale así. */
export function compareWhy(left: Frac, right: Frac, rightText?: string): string {
  const [a, b] = left;
  const [c, d] = right;
  const sign = compare(left, right);
  const r = rightText ?? f(right);
  if (b === d) return `Mismo denominador: gana el numerador más grande. ${f(left)} ${sign} ${r}.`;
  if (a === c) return `Mismo numerador: gana el denominador más pequeño (trozos más grandes). ${f(left)} ${sign} ${r}.`;
  if (d === 1) return `${r} = ${f([c * b, b])}. Comparamos ${f(left)} y ${f([c * b, b])}: ${f(left)} ${sign} ${r}.`;
  const m = lcm(b, d);
  return `Las pasamos al mismo denominador: ${f(left)} = ${f([(a * m) / b, m])} y ${f(right)} = ${f([(c * m) / d, m])}. Así ${f(left)} ${sign} ${r}.`;
}

/** Construye una tarea fija (siempre la misma). */
export function fixed(id: string, topic: string, label: string, task: Task): TaskQuestion {
  return { id, topic, kind: 'task', label, make: () => task };
}

/** Construye una tarea con números nuevos cada vez. */
export function generated(id: string, topic: string, label: string, make: TaskQuestion['make']): TaskQuestion {
  return { id, topic, kind: 'task', label, generated: true, make };
}

export function fieldsBody(fields: Field[], extra: Partial<Extract<Body, { type: 'fields' }>> = {}): Body {
  return { type: 'fields', fields, ...extra };
}

export function colorBody(figures: { shape: Shape; parts: number; target: number; label?: string }[]): Body {
  return { type: 'color', figures };
}
