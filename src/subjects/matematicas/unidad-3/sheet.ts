/**
 * La hoja de repaso del cole ("Repaso · Unidad 3 · Las fracciones · 4.º EPO",
 * versión ampliada), ejercicio a ejercicio y en el mismo orden. Las soluciones
 * se calculan a partir de los datos de la hoja.
 */
import type { TaskQuestion } from '../../../core/types';
import { compareRow, compareWhy, f, field, fieldsBody, fixed, frac, kindOf, mixed, mixedWhy, num, ofQty, ofQtyWhy, type Frac } from './kit';

const TOPIC = 'repaso';
const src = (n: number) => `📝 Hoja de repaso · ejercicio ${n}`;

/**
 * En la hoja, "Unitarias" son las fracciones iguales a la unidad (6/6, 12/12,
 * 4/4): son las que no son ni propias ni impropias.
 */
const BINS = ['Propia', 'Impropia', 'Unitaria'];
const binOf = (x: Frac) => ({ propia: 0, impropia: 1, unidad: 2 })[kindOf(x)];

function classify(n: number, items: Frac[]): TaskQuestion {
  return fixed(`repaso-${String(n).padStart(2, '0')}`, TOPIC, 'Clasificar fracciones', {
    text: 'Clasifica estas fracciones (unitaria = igual a la unidad).',
    body: { type: 'classify', items, bins: BINS, answers: items.map(binOf) },
    why: 'Propia: el numerador es menor que el denominador (vale menos que 1). Impropia: el numerador es mayor (vale más que 1). Unitaria: numerador y denominador iguales (vale 1).',
    source: src(n),
  });
}

function ofQuantity(n: number, q: number, xs: Frac[]): TaskQuestion {
  return fixed(`repaso-${String(n).padStart(2, '0')}`, TOPIC, `Fracciones de ${q}`, {
    text: 'Calcula las fracciones de estas cantidades.',
    body: fieldsBody(xs.map((x) => field(`${f(x)} de ${q}`, num(ofQty(x, q))))),
    why: xs.map((x) => ofQtyWhy(x, q)).join(' · '),
    source: src(n),
  });
}

function pairs(n: number, items: Frac[]): TaskQuestion {
  const found: [number, number][] = [];
  items.forEach(([a, b], i) => {
    items.forEach(([c, d], j) => {
      if (j > i && a * d === b * c) found.push([i, j]);
    });
  });
  return fixed(`repaso-${String(n).padStart(2, '0')}`, TOPIC, 'Unir fracciones equivalentes', {
    text: 'Une las fracciones que sean equivalentes.',
    body: { type: 'pairs', items, pairs: found },
    why: `Son equivalentes si se pasa de una a otra multiplicando o dividiendo arriba y abajo por el mismo número: ${found.map(([i, j]) => `${f(items[i]!)} = ${f(items[j]!)}`).join(' · ')}.`,
    source: src(n),
  });
}

function order(id: string, n: number, items: Frac[], dir: 'asc' | 'desc', why: string): TaskQuestion {
  return fixed(id, TOPIC, `Ordenar de ${dir === 'asc' ? 'menor a mayor' : 'mayor a menor'}`, {
    text: `Ordena de **${dir === 'asc' ? 'menor a mayor' : 'mayor a menor'}** estas fracciones.`,
    body: { type: 'order', items, dir },
    why,
    source: src(n),
  });
}

function ampSimp(n: number, xs: Frac[]): TaskQuestion {
  return fixed(`repaso-${String(n).padStart(2, '0')}`, TOPIC, 'Amplificar y simplificar', {
    text: 'Escribe una fracción equivalente por **amplificación** y otra por **simplificación**.',
    body: fieldsBody(xs.flatMap((x) => [field(`${f(x)} amplificada`, frac(x, 'amplify')), field(`${f(x)} simplificada`, frac(x, 'simplify'))])),
    why: `Amplificar: multiplicar arriba y abajo por el mismo número (p. ej., ×2: ${xs.map((x) => f([x[0] * 2, x[1] * 2])).join(', ')}). Simplificar: dividir arriba y abajo por el mismo número (p. ej., ${xs
      .map((x) => {
        for (const k of [2, 3, 5, 7]) if (x[0] % k === 0 && x[1] % k === 0) return `${f(x)} = ${f([x[0] / k, x[1] / k])}`;
        return f(x);
      })
      .join(', ')}).`,
    source: src(n),
  });
}

function sums(n: number, ops: [Frac, '+' | '−', Frac][]): TaskQuestion {
  const lcm = (a: number, b: number) => {
    let m = Math.max(a, b);
    while (m % a !== 0 || m % b !== 0) m++;
    return m;
  };
  const rows = ops.map(([a, op, b]) => {
    const m = lcm(a[1], b[1]);
    const an = (a[0] * m) / a[1];
    const bn = (b[0] * m) / b[1];
    const r: Frac = [op === '+' ? an + bn : an - bn, m];
    const step = a[1] === b[1] ? `${f(a)} ${op} ${f(b)} = ${f(r)}` : `${f(a)} ${op} ${f(b)} = ${f([an, m])} ${op} ${f([bn, m])} = ${f(r)}`;
    return { label: `${f(a)} ${op} ${f(b)}`, r, step };
  });
  return fixed(`repaso-${String(n).padStart(2, '0')}`, TOPIC, 'Sumar y restar fracciones', {
    text: 'Calcula. (Con distinto denominador, primero pásalas al mismo.)',
    body: fieldsBody(rows.map((row) => field(row.label, frac(row.r)))),
    why: rows.map((row) => row.step).join(' · '),
    source: src(n),
  });
}

function toMixed(n: number, xs: Frac[], text: string): TaskQuestion {
  return fixed(`repaso-${String(n).padStart(2, '0')}`, TOPIC, 'Pasar a número mixto', {
    text,
    body: fieldsBody(xs.map((x) => field(f(x), mixed(x)))),
    why: xs.map(mixedWhy).join(' '),
    source: src(n),
  });
}

const EX1: Frac[] = [
  [5, 9],
  [8, 3],
  [6, 6],
  [2, 7],
  [10, 4],
  [12, 12],
  [9, 5],
  [1, 8],
  [4, 4],
  [14, 9],
];

export const SHEET: TaskQuestion[] = [
  classify(1, EX1),
  fixed('repaso-02', TOPIC, 'Fracción coloreada', {
    text: 'Escribe la fracción que representa la parte coloreada de cada figura.',
    body: fieldsBody([
      { figure: { kind: 'shape', shape: 'bar', parts: 8, filled: 3 }, expect: frac([3, 8], 'exact') },
      { figure: { kind: 'shape', shape: 'circle', parts: 3, filled: 2 }, expect: frac([2, 3], 'exact') },
      { figure: { kind: 'shape', shape: 'bar', parts: 10, filled: 7 }, expect: frac([7, 10], 'exact') },
    ]),
    why: 'Abajo, los trozos iguales que hay; arriba, los coloreados: [3/8], [2/3] y [7/10].',
    source: src(2),
  }),
  ofQuantity(3, 30, [
    [1, 2],
    [2, 3],
    [1, 5],
    [3, 5],
  ]),
  fixed('repaso-04', TOPIC, 'Fracción a número decimal', {
    text: 'Transforma estas fracciones en **número decimal**.',
    body: fieldsBody(
      ([
        [5, 10],
        [25, 100],
        [8, 1000],
        [9, 100],
      ] as Frac[]).map((x) => field(f(x), num(x[0] / x[1]))),
    ),
    why: 'Denominador 10 → una cifra detrás de la coma; 100 → dos; 1000 → tres: [5/10] = 0,5 · [25/100] = 0,25 · [8/1000] = 0,008 · [9/100] = 0,09.',
    source: src(4),
  }),
  pairs(5, [
    [4, 8],
    [1, 3],
    [2, 5],
    [6, 8],
    [1, 2],
    [4, 10],
    [3, 4],
    [2, 6],
  ]),
  fixed('repaso-06', TOPIC, 'Comparar con <, > o =', {
    text: 'Compara las fracciones y elige **<**, **>** o **=**.',
    body: {
      type: 'rows',
      rows: [compareRow([3, 7], [5, 7]), compareRow([4, 9], [4, 5]), compareRow([6, 6], [1, 1], '1'), compareRow([7, 3], [2, 1], '2')],
    },
    why: [compareWhy([3, 7], [5, 7]), compareWhy([4, 9], [4, 5]), '[6/6] = 1 (numerador y denominador iguales).', '2 = [6/3], y [7/3] > [6/3], así que [7/3] > 2.'].join(' '),
    source: src(6),
  }),
  order(
    'repaso-07a',
    7,
    [
      [2, 9],
      [7, 9],
      [5, 9],
      [1, 9],
      [8, 9],
    ],
    'asc',
    'Mismo denominador: manda el numerador. [1/9] < [2/9] < [5/9] < [7/9] < [8/9].',
  ),
  order(
    'repaso-07b',
    7,
    [
      [5, 5],
      [5, 8],
      [5, 3],
      [5, 6],
      [5, 2],
    ],
    'asc',
    'Mismo numerador: cuanto mayor el denominador, menor la fracción. [5/8] < [5/6] < [5/5] < [5/3] < [5/2].',
  ),
  fixed('repaso-08', TOPIC, 'Colorear fracciones', {
    text: 'Colorea en cada dibujo la fracción que se indica.',
    body: {
      type: 'color',
      figures: [
        { shape: 'bar', parts: 5, target: 2, label: '[2/5]' },
        { shape: 'circle', parts: 4, target: 3, label: '[3/4]' },
        { shape: 'bar', parts: 6, target: 1, label: '[1/6]' },
      ],
    },
    why: 'El denominador ya es el número de trozos del dibujo; el numerador, los que hay que colorear: 2 de 5, 3 de 4 y 1 de 6.',
    source: src(8),
  }),
  toMixed(
    9,
    EX1.filter((x) => kindOf(x) === 'impropia'),
    'Transforma a **número mixto** las fracciones impropias del ejercicio 1.',
  ),
  fixed('repaso-10', TOPIC, 'Las ganancias de Marta', {
    text: 'Marta tiene [1/4] de una librería. Si las ganancias del primer mes han sido 800 €, ¿cuánto le corresponde a Marta?',
    body: fieldsBody([field(undefined, num(ofQty([1, 4], 800), '€'))]),
    why: `${ofQtyWhy([1, 4], 800)} €.`,
    source: src(10),
  }),
  ampSimp(11, [
    [10, 15],
    [16, 24],
    [9, 12],
    [5, 20],
  ]),
  sums(12, [
    [[3, 6], '+', [2, 6]],
    [[1, 2], '+', [1, 4]],
    [[9, 10], '−', [4, 10]],
    [[5, 2], '−', [1, 3]],
  ]),
  fixed('repaso-13a', TOPIC, 'Partes de una fracción', {
    text: '¿Cómo se llaman las partes de la fracción [3/4]?',
    body: {
      type: 'rows',
      rows: [
        { label: 'El **3** (arriba) es el…', options: ['Numerador', 'Denominador'], answer: 0 },
        { label: 'El **4** (abajo) es el…', options: ['Numerador', 'Denominador'], answer: 1 },
      ],
    },
    why: 'El **numerador** (3) son las partes que cogemos; el **denominador** (4), las partes iguales en que se divide la unidad.',
    source: src(13),
  }),
  fixed('repaso-13b', TOPIC, 'Dibujar 3/4', {
    text: 'Dibuja [3/4] en el círculo: colorea los trozos.',
    body: { type: 'color', figures: [{ shape: 'circle', parts: 4, target: 3 }] },
    why: 'El círculo está partido en 4 trozos iguales (denominador): coloreamos 3 (numerador).',
    source: src(13),
  }),
  fixed('repaso-14', TOPIC, 'Rodear la fracción de un grupo', {
    text: 'Rodea (toca) la fracción indicada de cada grupo.',
    body: {
      type: 'color',
      figures: [
        { shape: 'dots', parts: 10, target: ofQty([2, 5], 10), label: '[2/5] de 10 círculos' },
        { shape: 'squares', parts: 8, target: ofQty([3, 4], 8), label: '[3/4] de 8 cuadrados' },
      ],
    },
    why: `${ofQtyWhy([2, 5], 10)} círculos · ${ofQtyWhy([3, 4], 8)} cuadrados.`,
    source: src(14),
  }),
  fixed('repaso-15', TOPIC, 'Número decimal a fracción', {
    text: 'Transforma estos números decimales en **fracción**.',
    body: fieldsBody([field('0,3', frac([3, 10])), field('0,25', frac([25, 100])), field('0,007', frac([7, 1000])), field('0,9', frac([9, 10]))]),
    why: 'Una cifra detrás de la coma → décimos; dos → centésimos; tres → milésimos: 0,3 = [3/10] · 0,25 = [25/100] · 0,007 = [7/1000] · 0,9 = [9/10].',
    source: src(15),
  }),
  fixed('repaso-16', TOPIC, 'Completar fracciones equivalentes', {
    text: 'Completa los huecos para que las fracciones sean **equivalentes**.',
    body: fieldsBody([
      field('[1/2] = [?/8]', num(4)),
      field('[3/5] = [9/?]', num(15)),
      field('[2/3] = [?/12]', num(8)),
      field('[20/30] = [2/?]', num(3)),
    ]),
    why: '[1/2] → ×4 → [4/8] · [3/5] → ×3 → [9/15] · [2/3] → ×4 → [8/12] · [20/30] → :10 → [2/3].',
    source: src(16),
  }),
  classify(17, [
    [7, 7],
    [3, 10],
    [11, 4],
    [2, 9],
    [5, 5],
    [13, 6],
    [6, 8],
    [9, 2],
    [1, 12],
    [17, 17],
  ]),
  fixed('repaso-18', TOPIC, 'La recta numérica', {
    text: 'Escribe la fracción que corresponde a cada letra de la recta numérica.',
    figure: {
      kind: 'line',
      parts: 6,
      points: [
        { label: 'A', at: 1 / 6 },
        { label: 'B', at: 4 / 6 },
        { label: 'C', at: 5 / 6 },
      ],
    },
    body: fieldsBody([field('A', frac([1, 6])), field('B', frac([4, 6])), field('C', frac([5, 6]))]),
    why: 'Del 0 al 1 hay 6 trozos iguales: cada salto es [1/6]. A está en el primero ([1/6]), B en el cuarto ([4/6]) y C en el quinto ([5/6]).',
    source: src(18),
  }),
  order(
    'repaso-19a',
    19,
    [
      [4, 7],
      [9, 7],
      [1, 7],
      [6, 7],
      [3, 7],
    ],
    'desc',
    'Mismo denominador: manda el numerador. [9/7] > [6/7] > [4/7] > [3/7] > [1/7].',
  ),
  order(
    'repaso-19b',
    19,
    [
      [3, 3],
      [3, 5],
      [3, 2],
      [3, 8],
      [3, 4],
    ],
    'desc',
    'Mismo numerador: cuanto menor el denominador, mayor la fracción. [3/2] > [3/3] > [3/4] > [3/5] > [3/8].',
  ),
  ofQuantity(20, 40, [
    [1, 4],
    [3, 4],
    [1, 8],
    [5, 8],
  ]),
  pairs(21, [
    [6, 9],
    [1, 4],
    [3, 15],
    [6, 10],
    [2, 8],
    [2, 3],
    [3, 5],
    [1, 5],
  ]),
  fixed('repaso-22', TOPIC, 'Alumnos con gafas', {
    text: 'En una clase de 24 alumnos, [3/8] llevan gafas. ¿Cuántos alumnos llevan gafas?',
    body: fieldsBody([field(undefined, num(ofQty([3, 8], 24), 'alumnos'))]),
    why: `${ofQtyWhy([3, 8], 24)} alumnos.`,
    source: src(22),
  }),
  ampSimp(23, [
    [12, 18],
    [20, 25],
    [4, 10],
    [14, 28],
  ]),
  fixed('repaso-24', TOPIC, 'La tarta de Ana y Pablo', {
    text: 'Una tarta tiene 8 trozos iguales. Ana se come [3/8] y Pablo [2/8].',
    body: fieldsBody([field('¿Qué fracción se han comido entre los dos?', frac([5, 8])), field('¿Qué fracción queda?', frac([3, 8]))]),
    why: 'Comido: [3/8] + [2/8] = [5/8]. La tarta entera es [8/8]: queda [8/8] − [5/8] = [3/8].',
    source: src(24),
  }),
  sums(25, [
    [[4, 7], '+', [2, 7]],
    [[1, 5], '+', [3, 10]],
    [[11, 12], '−', [5, 12]],
    [[5, 4], '−', [1, 2]],
  ]),
  toMixed(
    26,
    [
      [7, 2],
      [11, 4],
      [13, 5],
      [17, 6],
    ],
    'Transforma estas fracciones impropias en **número mixto**.',
  ),
];
