/**
 * Ejercicios de los apartados del temario: los de "Practica" del documento
 * (siempre iguales) y otros que salen con números nuevos cada vez.
 */
import { choiceTask } from '../../../core/task';
import type { TaskQuestion } from '../../../core/types';
import { denominatorWord, fractionWords, numberWords } from '../../../lib/frac';
import {
  colorBody,
  compareRow,
  compareWhy,
  f,
  field,
  fieldsBody,
  fixed,
  frac,
  generated,
  int,
  lcm,
  mixed,
  mixedText,
  mixedWhy,
  num,
  numText,
  ofQty,
  ofQtyWhy,
  pick,
  shuffle,
  simpleFrac,
  type Frac,
  type Kind,
} from './kit';

const KIND_NAMES: Record<Kind, string> = { propia: 'Propia', impropia: 'Impropia', unidad: 'Igual a la unidad' };
const KIND_WHY: Record<Kind, string> = {
  propia: 'El numerador es **menor** que el denominador: es **propia** y vale menos que 1.',
  impropia: 'El numerador es **mayor** que el denominador: es **impropia** y vale más que 1.',
  unidad: 'El numerador y el denominador son **iguales**: vale **1**.',
};

// ---------- 1. Qué es una fracción ----------

const que: TaskQuestion[] = [
  generated('que-partes', 'que', 'Numerador y denominador', (rng) => {
    const [n, d] = simpleFrac(rng, 9);
    const askTop = rng() < 0.5;
    const which = askTop ? n : d;
    return choiceTask(
      `En la fracción ${f([n, d])}, ¿cómo se llama el **${which}**?`,
      askTop ? 'Numerador' : 'Denominador',
      [askTop ? 'Denominador' : 'Numerador'],
      'El **numerador** está arriba: las partes que cogemos. El **denominador** está abajo: las partes iguales en que se divide la unidad.',
      2,
      rng,
    );
  }),
  generated('que-significa', 'que', 'Qué indica cada número', (rng, { choices }) => {
    const [n, d] = simpleFrac(rng, 9);
    const askTop = rng() < 0.5;
    const top = `Las partes que cogemos (${n})`;
    const bottom = `Las partes iguales en que se divide la unidad (${d})`;
    return choiceTask(
      `En ${f([n, d])}, ¿qué indica el **${askTop ? 'numerador' : 'denominador'}**?`,
      askTop ? top : bottom,
      [askTop ? bottom : top, 'Cuántas unidades enteras hay'],
      `En ${f([n, d])} la unidad se divide en ${d} partes iguales (denominador) y cogemos ${n} (numerador).`,
      Math.min(3, choices),
      rng,
    );
  }),
  generated('que-tipo', 'que', 'Propia, impropia o igual a la unidad', (rng) => {
    const kind = pick<Kind>(['propia', 'impropia', 'unidad'], rng);
    const d = int(rng, 2, 12);
    const n = kind === 'propia' ? int(rng, 1, d - 1) : kind === 'unidad' ? d : int(rng, d + 1, 2 * d + 3);
    return choiceTask(
      `¿Qué tipo de fracción es ${f([n, d])}?`,
      KIND_NAMES[kind],
      Object.values(KIND_NAMES).filter((k) => k !== KIND_NAMES[kind]),
      KIND_WHY[kind],
      3,
      rng,
    );
  }),
  generated('que-dibujo', 'que', 'Fracción coloreada', (rng) => {
    const shape = rng() < 0.5 ? 'bar' : 'circle';
    const parts = int(rng, 2, shape === 'bar' ? 10 : 8);
    const filled = int(rng, 1, parts - 1);
    return {
      text: '¿Qué fracción representa la parte coloreada?',
      figure: { kind: 'shape', shape, parts, filled },
      body: fieldsBody([field(undefined, frac([filled, parts], 'exact'))]),
      why: `Hay ${parts} trozos iguales (denominador) y ${filled} coloreados (numerador): ${f([filled, parts])}.`,
    };
  }),
  generated('que-colorea', 'que', 'Colorear una fracción', (rng) => {
    const shape = rng() < 0.6 ? 'bar' : 'circle';
    const parts = int(rng, 3, shape === 'bar' ? 10 : 8);
    const target = int(rng, 1, parts - 1);
    return {
      text: `Toca los trozos para colorear ${f([target, parts])}.`,
      body: colorBody([{ shape, parts, target }]),
      why: `El denominador dice en cuántos trozos está partida (${parts}); el numerador, cuántos coloreamos (${target}).`,
    };
  }),
  generated('que-mixto', 'que', 'De impropia a número mixto', (rng) => {
    const d = int(rng, 2, 9);
    const n = d * int(rng, 1, 3) + int(rng, 1, d - 1);
    return {
      text: `Pasa ${f([n, d])} a número mixto.`,
      body: fieldsBody([field(f([n, d]), mixed([n, d]))]),
      why: mixedWhy([n, d]),
    };
  }),
  generated('que-impropia', 'que', 'De número mixto a fracción', (rng) => {
    const d = int(rng, 2, 8);
    const w = int(rng, 1, 3);
    const r = int(rng, 1, d - 1);
    const n = w * d + r;
    return {
      text: `Pasa el número mixto ${mixedText([n, d])} a fracción impropia.`,
      body: fieldsBody([field(mixedText([n, d]), frac([n, d], 'exact'))]),
      why: `${w} ${w === 1 ? 'entero son' : 'enteros son'} ${w} × ${d} = ${w * d} trozos de ${d}; más ${r}: ${w * d} + ${r} = ${n}. Así, ${mixedText([n, d])} = ${f([n, d])}.`,
    };
  }),
  generated('que-serie', 'que', 'Completar una serie', (rng) => {
    const d = int(rng, 3, 7);
    const start = int(rng, 1, 3);
    const items = Array.from({ length: 5 }, (_, i) => start + i);
    const holes = shuffle([1, 2, 3, 4], rng).slice(0, 2).sort((a, b) => a - b);
    const series = items.map((n, i) => (holes.includes(i) ? '□' : f([n, d]))).join(', ');
    return {
      text: `Completa la serie: ${series}`,
      body: fieldsBody(holes.map((h, k) => field(`${k === 0 ? 'Primer' : 'Segundo'} hueco`, frac([items[h]!, d], 'exact')))),
      why: `Cada fracción tiene un trozo más que la anterior (el numerador sube de 1 en 1): ${items.map((n) => f([n, d])).join(', ')}.`,
    };
  }),
  fixed('que-clasifica', 'que', 'Clasificar fracciones', {
    text: 'Clasifica en propias, impropias o iguales a la unidad.',
    body: {
      type: 'classify',
      items: [
        [2, 7],
        [3, 2],
        [6, 6],
        [8, 5],
        [3, 3],
        [7, 5],
      ],
      bins: ['Propia', 'Impropia', 'Igual a 1'],
      answers: [0, 1, 2, 1, 2, 1],
    },
    why: 'Propia: arriba menos que abajo (vale menos que 1). Impropia: arriba más que abajo (más que 1). Igual a la unidad: arriba y abajo iguales.',
    source: 'Temario · Practica',
  }),
  fixed('que-mixtas', 'que', 'Impropias a número mixto', {
    text: 'Pasa a número mixto las fracciones impropias.',
    body: fieldsBody(
      ([
        [3, 2],
        [8, 5],
        [7, 5],
      ] as Frac[]).map((x) => field(f(x), mixed(x))),
    ),
    why: `${mixedWhy([3, 2])} ${mixedWhy([8, 5])} ${mixedWhy([7, 5])}`,
    source: 'Temario · Practica',
  }),
  fixed('que-serie-libro', 'que', 'La serie de quintos', {
    text: 'Completa la serie: [1/5], □, □, □, [5/5] = 1, [6/5], □, □, □, [10/5] = 2',
    body: fieldsBody([2, 3, 4, 7, 8, 9].map((n, i) => field(`Hueco ${i + 1}`, frac([n, 5], 'exact')))),
    why: 'Vamos de quinto en quinto: [1/5], [2/5], [3/5], [4/5], [5/5] = 1, [6/5], [7/5], [8/5], [9/5], [10/5] = 2.',
    source: 'Temario · Practica',
  }),
];

// ---------- 2. Cómo se leen ----------

const READ_DENS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 20];

function readOptions(rng: () => number, [n, d]: Frac): string[] {
  const out = new Set<string>();
  const others = shuffle(
    READ_DENS.filter((x) => x !== d),
    rng,
  );
  if (n >= 2 && n !== d && READ_DENS.includes(n)) out.add(`${numberWords(d)} ${denominatorWord(n)}${d === 1 ? '' : 's'}`);
  for (const other of others) {
    if (out.size >= 3) break;
    out.add(fractionWords([n, other]));
  }
  return [...out];
}

const leer: TaskQuestion[] = [
  generated('leer-como', 'leer', 'Cómo se lee una fracción', (rng, { choices }) => {
    const d = pick(READ_DENS, rng);
    const n = int(rng, 1, Math.min(d + 2, 12));
    return choiceTask(
      `¿Cómo se lee ${f([n, d])}?`,
      fractionWords([n, d]),
      readOptions(rng, [n, d]),
      `Primero el numerador (${numberWords(n)}) y luego el denominador: ${d} se lee «${denominatorWord(d)}»${d > 10 ? ' (a partir del 11 se añade -avo)' : ''}.`,
      choices,
      rng,
    );
  }),
  generated('leer-cual', 'leer', 'Qué fracción es', (rng, { choices }) => {
    const d = pick(READ_DENS.slice(0, 10), rng);
    const n = int(rng, 1, d - 1);
    const wrong = [f([d, n]), f([n, d + 1]), f([n + 1, d])].filter((w) => w !== f([n, d]));
    return choiceTask(
      `¿Qué fracción es «${fractionWords([n, d])}»?`,
      f([n, d]),
      [...new Set(wrong)],
      `«${fractionWords([n, d])}»: ${numberWords(n)} arriba (numerador) y ${d} abajo (denominador, se lee «${denominatorWord(d)}»).`,
      choices,
      rng,
    );
  }),
  fixed('leer-juan', 'leer', 'La edad de la hermana de Juan', {
    text: 'Juan tiene 6 años y su hermana **la mitad**.',
    body: fieldsBody([field('¿Qué edad tiene ella?', num(3, 'años')), field('Cuando Juan tenga 8, ¿cuántos tendrá ella?', num(5, 'años'))]),
    why: 'La mitad de 6 es 3. Cuando Juan tenga 8 habrán pasado 2 años **para los dos**: 3 + 2 = 5. ¡Cuidado, no es la mitad de 8!',
    source: 'Temario · Practica',
  }),
  fixed('leer-clase', 'leer', 'Niñas y niños de la clase', {
    text: 'En una clase hay 20 personas y [1/4] son niñas.',
    body: fieldsBody([field('¿Cuántas niñas hay?', num(5)), field('¿Y niños?', num(15))]),
    why: '[1/4] de 20 = 20 : 4 = 5 niñas. Niños: 20 − 5 = 15.',
    source: 'Temario · Practica',
  }),
  fixed('leer-deposito', 'leer', 'El depósito de gasolina', {
    text: 'Un depósito de gasolina de 50 litros marca [2/5]. ¿Cuántos litros quedan?',
    body: fieldsBody([field(undefined, num(20, 'litros'))]),
    why: `[2/5] de 50 = ${ofQtyWhy([2, 5], 50)} litros.`,
    source: 'Temario · Practica',
  }),
  fixed('leer-tabla', 'leer', 'Medios, tercios, cuartos y quintos de 1 kg, 1 l y 1 km', {
    text: 'Completa: ¿cuánto es cada fracción? (1 kg = 1000 g · 1 litro = 1000 mL · 1 km = 1000 m)',
    body: fieldsBody([
      field('[1/2] de 1 litro', num(500, 'mL')),
      field('[1/2] de 1 km', num(500, 'm')),
      field('[1/3] de 1 kg', num(333.33, 'g')),
      field('[1/4] de 1 kg', num(250, 'g')),
      field('[1/4] de 1 litro', num(250, 'mL')),
      field('[1/5] de 1 kg', num(200, 'g')),
      field('[1/5] de 1 km', num(200, 'm')),
    ]),
    why: 'Se divide 1000 entre el denominador: 1000 : 2 = 500 · 1000 : 3 = 333,33 · 1000 : 4 = 250 · 1000 : 5 = 200.',
    source: 'Temario · Practica',
  }),
];

// ---------- 3. Fracciones decimales ----------

const DEC_DENS = [10, 10, 100, 100, 1000];

function decimalOf([n, d]: Frac): number {
  return n / d;
}

const dec: TaskQuestion[] = [
  generated('dec-a-decimal', 'dec', 'Fracción decimal a número decimal', (rng) => {
    const d = pick(DEC_DENS, rng);
    const n = d === 10 ? int(rng, 1, 19) : d === 100 ? pick([int(rng, 1, 9), int(rng, 11, 99)], rng) : int(rng, 1, 99);
    const x = decimalOf([n, d]);
    const digits = d === 10 ? 'una cifra' : d === 100 ? 'dos cifras' : 'tres cifras';
    return {
      text: `Escribe ${f([n, d])} como número decimal.`,
      body: fieldsBody([field(f([n, d]), num(x))]),
      why: `Con denominador ${d} hay ${digits} detrás de la coma: ${f([n, d])} = ${numText(x)}.`,
    };
  }),
  generated('dec-a-fraccion', 'dec', 'Número decimal a fracción', (rng) => {
    const d = pick(DEC_DENS, rng);
    const n = d === 10 ? int(rng, 1, 9) : d === 100 ? int(rng, 1, 99) : int(rng, 1, 9);
    const x = decimalOf([n, d]);
    return {
      text: `Escribe ${numText(x)} como fracción decimal.`,
      body: fieldsBody([field(numText(x), frac([n, d], 'equivalent'))]),
      why: `Cuenta las cifras detrás de la coma: ${d === 10 ? 'una → décimos (10)' : d === 100 ? 'dos → centésimos (100)' : 'tres → milésimos (1000)'}. ${numText(x)} = ${f([n, d])}.`,
    };
  }),
  generated('dec-cual', 'dec', 'Qué número decimal es', (rng, { choices }) => {
    const d = pick([10, 100], rng);
    const n = int(rng, 1, 9);
    const x = n / d;
    const wrong = [n / (d === 10 ? 100 : 10), n, n / 1000].map(numText);
    return choiceTask(
      `¿Qué número decimal es ${f([n, d])}?`,
      numText(x),
      wrong,
      `${f([n, d])} se lee «${fractionWords([n, d])}»: ${d === 10 ? 'una cifra' : 'dos cifras'} detrás de la coma → ${numText(x)}.`,
      choices,
      rng,
    );
  }),
  generated('dec-lee', 'dec', 'Leer fracciones decimales', (rng, { choices }) => {
    const d = pick([10, 100, 1000], rng);
    const n = int(rng, 2, 19);
    const others = [10, 100, 1000].filter((x) => x !== d);
    return choiceTask(
      `¿Cómo se lee ${f([n, d])}?`,
      fractionWords([n, d]),
      [...others.map((o) => fractionWords([n, o])), `${numberWords(n)} decenas`],
      `Denominador ${d}: «${denominatorWord(d)}s». ${f([n, d])} = ${fractionWords([n, d])}.`,
      choices,
      rng,
    );
  }),
  fixed('dec-pasa', 'dec', 'A número decimal', {
    text: 'Pasa a número decimal.',
    body: fieldsBody(
      ([
        [2, 10],
        [7, 10],
        [10, 10],
        [19, 100],
      ] as Frac[]).map((x) => field(f(x), num(decimalOf(x)))),
    ),
    why: '[2/10] = 0,2 · [7/10] = 0,7 · [10/10] = 1 (diez décimos son una unidad) · [19/100] = 0,19.',
    source: 'Temario · Practica',
  }),
  fixed('dec-fraccion', 'dec', 'A fracción decimal', {
    text: 'Pasa a fracción decimal.',
    body: fieldsBody([field('0,05', frac([5, 100])), field('0,7', frac([7, 10])), field('1', frac([10, 10])), field('1,5', frac([15, 10]))]),
    why: '0,05 = [5/100] · 0,7 = [7/10] · 1 = [10/10] · 1,5 = [15/10] (quince décimos).',
    source: 'Temario · Practica',
  }),
  fixed('dec-dedos', 'dec', 'Los dedos de las dos manos', {
    text: '¿Qué fracción de los dedos de las dos manos son…?',
    body: fieldsBody([field('3 dedos', frac([3, 10])), field('7 dedos', frac([7, 10]))]),
    why: 'Las dos manos tienen 10 dedos (denominador): 3 dedos son [3/10] y 7 dedos son [7/10].',
    source: 'Temario · Practica',
  }),
  fixed('dec-billete', 'dec', 'Partes de un billete de 10 €', {
    text: '¿Qué fracción de un billete de 10 € son…?',
    body: fieldsBody([field('Dos monedas de 2 €', frac([4, 10])), field('Un billete de 5 €', frac([5, 10])), field('Una moneda de 1 €', frac([1, 10]))]),
    why: 'Cada euro es [1/10] de 10 €: 4 € son [4/10], 5 € son [5/10] y 1 € es [1/10].',
    source: 'Temario · Practica',
  }),
];

// ---------- 4. Fracciones equivalentes ----------

const equiv: TaskQuestion[] = [
  generated('equiv-hueco', 'equiv', 'Completar el hueco', (rng) => {
    const [n, d] = simpleFrac(rng, 6);
    const k = int(rng, 2, 5);
    const top = rng() < 0.5;
    return {
      text: 'Completa el hueco para que las fracciones sean equivalentes.',
      body: fieldsBody([field(top ? `${f([n, d])} = [?/${d * k}]` : `${f([n, d])} = [${n * k}/?]`, num(top ? n * k : d * k))]),
      why: `${top ? `El denominador pasa de ${d} a ${d * k}` : `El numerador pasa de ${n} a ${n * k}`}: se ha multiplicado por ${k}. Lo mismo arriba y abajo: ${f([n, d])} = ${f([n * k, d * k])}.`,
    };
  }),
  generated('equiv-amplifica', 'equiv', 'Amplificar', (rng) => {
    const x = simpleFrac(rng, 9);
    return {
      text: `Escribe una fracción equivalente a ${f(x)} por **amplificación**.`,
      body: fieldsBody([field(f(x), frac(x, 'amplify'))]),
      why: `Amplificar es **multiplicar** arriba y abajo por el mismo número. Por ejemplo, por 2: ${f(x)} = ${f([x[0] * 2, x[1] * 2])}.`,
    };
  }),
  generated('equiv-simplifica', 'equiv', 'Simplificar', (rng) => {
    const [n, d] = simpleFrac(rng, 7);
    const k = int(rng, 2, 5);
    const x: Frac = [n * k, d * k];
    return {
      text: `Escribe una fracción equivalente a ${f(x)} por **simplificación**.`,
      body: fieldsBody([field(f(x), frac(x, 'simplify'))]),
      why: `Simplificar es **dividir** arriba y abajo por el mismo número. ${x[0]} y ${x[1]} se pueden dividir entre ${k}: ${f(x)} = ${f([n, d])}.`,
    };
  }),
  generated('equiv-cual', 'equiv', 'Cuál es equivalente', (rng, { choices }) => {
    const [n, d] = simpleFrac(rng, 6);
    const k = int(rng, 2, 4);
    const right: Frac = [n * k, d * k];
    const wrong = [f([n + k, d + k]), f([n * k, d]), f([n, d * k]), f([n * k + 1, d * k])];
    return choiceTask(
      `¿Qué fracción es equivalente a ${f([n, d])}?`,
      f(right),
      [...new Set(wrong)].filter((w) => w !== f(right)),
      `${f([n, d])} × ${k} arriba y abajo = ${f(right)}. Sumar el mismo número arriba y abajo **no** da una equivalente.`,
      choices,
      rng,
    );
  }),
  generated('equiv-mismo-den', 'equiv', 'Pasar al mismo denominador', (rng) => {
    const PAIRS: [Frac, Frac][] = [
      [[4, 5], [7, 10]],
      [[1, 2], [1, 4]],
      [[1, 2], [3, 5]],
      [[1, 4], [3, 12]],
      [[1, 5], [4, 10]],
      [[4, 6], [4, 12]],
      [[2, 3], [3, 5]],
      [[1, 3], [5, 6]],
      [[3, 4], [1, 6]],
    ];
    const [a, b] = pick(PAIRS, rng);
    const m = lcm(a[1], b[1]);
    return {
      text: `Pasa ${f(a)} y ${f(b)} al **mismo denominador**.`,
      body: fieldsBody([field(f(a), frac(a)), field(f(b), frac(b))], { sameDenominator: true }),
      why: `Buscamos un número que esté en la tabla de ${a[1]} y en la de ${b[1]}: ${m}. ${f(a)} = ${f([(a[0] * m) / a[1], m])} y ${f(b)} = ${f([(b[0] * m) / b[1], m])}.`,
    };
  }),
  generated('equiv-mayor', 'equiv', 'Cuál es mayor (distinto denominador)', (rng) => {
    const DOC: [Frac, Frac][] = [
      [[2, 5], [7, 15]],
      [[1, 2], [2, 6]],
      [[2, 3], [4, 5]],
      [[4, 6], [3, 5]],
    ];
    let pair = pick(DOC, rng);
    if (rng() < 0.5) {
      for (;;) {
        const a = simpleFrac(rng, 6);
        const b = simpleFrac(rng, 6);
        if (a[1] !== b[1] && a[0] * b[1] !== b[0] * a[1]) {
          pair = [a, b];
          break;
        }
      }
    }
    const [a, b] = pair;
    const bigger = a[0] * b[1] > b[0] * a[1] ? a : b;
    return choiceTask(`¿Cuál es mayor: ${f(a)} o ${f(b)}?`, f(bigger), [f(bigger === a ? b : a)], compareWhy(a, b), 2, rng);
  }),
  fixed('equiv-tres-quintos', 'equiv', 'Cuatro equivalentes a 3/5', {
    text: 'Busca **cuatro** fracciones equivalentes a [3/5] por amplificación (distintas).',
    body: fieldsBody(
      [1, 2, 3, 4].map((i) => field(`${i}.ª`, frac([3, 5], 'amplify'))),
      { distinct: true },
    ),
    why: 'Multiplica arriba y abajo por 2, 3, 4, 5…: [6/10], [9/15], [12/20], [15/25].',
    source: 'Temario · Practica',
  }),
  fixed('equiv-24-48', 'equiv', 'Cuatro equivalentes a 24/48', {
    text: 'Busca **cuatro** fracciones equivalentes a [24/48] por simplificación (distintas).',
    body: fieldsBody(
      [1, 2, 3, 4].map((i) => field(`${i}.ª`, frac([24, 48], 'simplify'))),
      { distinct: true },
    ),
    why: 'Divide arriba y abajo por el mismo número: :2 → [12/24], :3 → [8/16], :4 → [6/12], :6 → [4/8], :8 → [3/6], :12 → [2/4], :24 → [1/2].',
    source: 'Temario · Practica',
  }),
];

// ---------- 5. Orden de fracciones ----------

const orden: TaskQuestion[] = [
  generated('orden-compara', 'orden', 'Comparar con <, > o =', (rng) => {
    const kind = pick(['den', 'den', 'num', 'num', 'one', 'two', 'equiv'], rng);
    let left: Frac;
    let right: Frac;
    let rightText: string | undefined;
    if (kind === 'den') {
      const d = int(rng, 3, 12);
      left = [int(rng, 1, d + 3), d];
      right = [int(rng, 1, d + 3), d];
    } else if (kind === 'num') {
      const n = int(rng, 1, 9);
      left = [n, int(rng, 2, 12)];
      right = [n, int(rng, 2, 12)];
    } else if (kind === 'one') {
      const d = int(rng, 2, 9);
      left = [int(rng, 1, 2 * d), d];
      right = [1, 1];
      rightText = '1';
    } else if (kind === 'two') {
      const d = int(rng, 2, 6);
      left = [int(rng, d, 3 * d), d];
      right = [2, 1];
      rightText = '2';
    } else {
      const x = simpleFrac(rng, 5);
      const k = int(rng, 2, 3);
      left = x;
      right = [x[0] * k, x[1] * k];
    }
    return {
      text: 'Compara y elige **<**, **>** o **=**.',
      body: { type: 'rows', rows: [compareRow(left, right, rightText)] },
      why: compareWhy(left, right, rightText),
    };
  }),
  generated('orden-ordena', 'orden', 'Ordenar fracciones', (rng) => {
    const sameDen = rng() < 0.5;
    const dir = rng() < 0.5 ? 'asc' : 'desc';
    let items: Frac[];
    if (sameDen) {
      const d = int(rng, 5, 12);
      items = shuffle(
        Array.from({ length: d + 3 }, (_, i) => i + 1),
        rng,
      )
        .slice(0, 5)
        .map((n) => [n, d] as Frac);
    } else {
      const n = int(rng, 1, 7);
      items = shuffle(
        Array.from({ length: 11 }, (_, i) => i + 2),
        rng,
      )
        .slice(0, 5)
        .map((d) => [n, d] as Frac);
    }
    return {
      text: `Ordena de **${dir === 'asc' ? 'menor a mayor' : 'mayor a menor'}**.`,
      body: { type: 'order', items, dir },
      why: sameDen
        ? 'Tienen el **mismo denominador**: es mayor la que tiene el **numerador más grande**.'
        : 'Tienen el **mismo numerador**: es mayor la que tiene el **denominador más pequeño** (los trozos son más grandes).',
    };
  }),
  fixed('orden-doceavos', 'orden', 'Ordenar doceavos', {
    text: 'Ordena de **mayor a menor**.',
    body: {
      type: 'order',
      items: [
        [4, 12],
        [12, 12],
        [2, 12],
        [7, 12],
        [5, 12],
        [21, 12],
      ],
      dir: 'desc',
    },
    why: 'Mismo denominador: manda el numerador. [21/12] > [12/12] > [7/12] > [5/12] > [4/12] > [2/12].',
    source: 'Temario · Practica',
  }),
  fixed('orden-sietes', 'orden', 'Ordenar con numerador 7', {
    text: 'Ordena de **menor a mayor**.',
    body: {
      type: 'order',
      items: [
        [7, 2],
        [7, 6],
        [7, 11],
        [7, 7],
        [7, 4],
        [7, 14],
      ],
      dir: 'asc',
    },
    why: 'Mismo numerador: cuanto **mayor** el denominador, **menor** la fracción. [7/14] < [7/11] < [7/7] < [7/6] < [7/4] < [7/2].',
    source: 'Temario · Practica',
  }),
  fixed('orden-series', 'orden', 'Series cada vez mayores', {
    text: 'Continúa cada serie con dos fracciones más, cada vez mayores. a) [1/9], [3/9], □, □ · b) [3/9], [3/7], □, □',
    body: fieldsBody([
      field('a) 1.º', frac([5, 9], 'exact')),
      field('a) 2.º', frac([7, 9], 'exact')),
      field('b) 1.º', frac([3, 5], 'exact')),
      field('b) 2.º', frac([3, 3], 'exact')),
    ]),
    why: 'a) El numerador sube de 2 en 2: [5/9], [7/9]. b) El denominador baja de 2 en 2 (trozos más grandes): [3/5], [3/3].',
    source: 'Temario · Practica',
  }),
];

// ---------- 6. Suma y resta ----------

function sumTask(a: Frac, b: Frac, op: '+' | '−'): { text: string; result: Frac; why: string } {
  const m = lcm(a[1], b[1]);
  const an = (a[0] * m) / a[1];
  const bn = (b[0] * m) / b[1];
  const rn = op === '+' ? an + bn : an - bn;
  const same = a[1] === b[1];
  const why = same
    ? `Mismo denominador: ${op === '+' ? 'sumamos' : 'restamos'} los numeradores (${a[0]} ${op} ${b[0]} = ${rn}) y el denominador no cambia: ${f([rn, m])}.`
    : `Primero al mismo denominador (${m}): ${f(a)} = ${f([an, m])} y ${f(b)} = ${f([bn, m])}. Después ${f([an, m])} ${op} ${f([bn, m])} = ${f([rn, m])}.`;
  return { text: `${f(a)} ${op} ${f(b)}`, result: [rn, m], why };
}

const suma: TaskQuestion[] = [
  generated('suma-mismo', 'suma', 'Sumar con el mismo denominador', (rng) => {
    const d = int(rng, 3, 12);
    const a: Frac = [int(rng, 1, d - 1), d];
    const b: Frac = [int(rng, 1, d - 1), d];
    const s = sumTask(a, b, '+');
    return { text: 'Calcula.', body: fieldsBody([field(s.text, frac(s.result))]), why: s.why };
  }),
  generated('suma-resta-mismo', 'suma', 'Restar con el mismo denominador', (rng) => {
    const d = int(rng, 3, 12);
    const x = int(rng, 2, d + 2);
    const y = int(rng, 1, x - 1);
    const s = sumTask([x, d], [y, d], '−');
    return { text: 'Calcula.', body: fieldsBody([field(s.text, frac(s.result))]), why: s.why };
  }),
  generated('suma-distinto', 'suma', 'Sumar con distinto denominador', (rng) => {
    const b = int(rng, 2, 5);
    const k = int(rng, 2, 3);
    const s = sumTask([int(rng, 1, b - 1), b], [int(rng, 1, b * k - 1), b * k], '+');
    return {
      text: 'Calcula (primero, al mismo denominador).',
      body: fieldsBody([field(s.text, frac(s.result))]),
      why: s.why,
    };
  }),
  generated('suma-resta-distinto', 'suma', 'Restar con distinto denominador', (rng) => {
    for (;;) {
      const [b, d] = pick(
        [
          [2, 4],
          [2, 6],
          [3, 6],
          [4, 8],
          [5, 10],
          [2, 3],
          [2, 5],
          [3, 4],
        ] as [number, number][],
        rng,
      );
      const a: Frac = [int(rng, 1, 2 * b), b];
      const c: Frac = [int(rng, 1, d - 1), d];
      if (a[0] * d > c[0] * b) {
        const s = sumTask(a, c, '−');
        return { text: 'Calcula (primero, al mismo denominador).', body: fieldsBody([field(s.text, frac(s.result))]), why: s.why };
      }
    }
  }),
  generated('suma-problema', 'suma', 'Problemas de sumar y restar', (rng) => {
    const d = pick([6, 8, 10, 12], rng);
    const a = int(rng, 1, Math.floor(d / 2));
    const b = int(rng, 1, d - a - 1);
    const who = pick(
      [
        ['Ana', 'Pablo'],
        ['Eva', 'Lucas'],
        ['Mía', 'Leo'],
      ],
      rng,
    );
    return {
      text: `Una tarta tiene ${d} trozos iguales. ${who[0]} se come ${f([a, d])} y ${who[1]} ${f([b, d])}.`,
      body: fieldsBody([field('¿Qué fracción se han comido entre los dos?', frac([a + b, d])), field('¿Qué fracción queda?', frac([d - a - b, d]))]),
      why: `Comido: ${f([a, d])} + ${f([b, d])} = ${f([a + b, d])}. La tarta entera es ${f([d, d])}: quedan ${f([d, d])} − ${f([a + b, d])} = ${f([d - a - b, d])}.`,
    };
  }),
  fixed('suma-libro', 'suma', 'Sumas del temario', {
    text: 'Calcula las sumas.',
    body: fieldsBody(
      ([
        [[3, 5], [1, 5]],
        [[6, 8], [3, 8]],
        [[4, 7], [5, 7]],
        [[3, 6], [1, 6]],
        [[7, 12], [5, 12]],
      ] as [Frac, Frac][]).map(([a, b]) => {
        const s = sumTask(a, b, '+');
        return field(s.text, frac(s.result));
      }),
    ),
    why: 'Mismo denominador: se suman los numeradores y el denominador se queda igual. [4/5] · [9/8] · [9/7] · [4/6] · [12/12].',
    source: 'Temario · Practica',
  }),
  fixed('suma-resta-libro', 'suma', 'Restas del temario', {
    text: 'Calcula las restas.',
    body: fieldsBody(
      ([
        [[2, 3], [1, 3]],
        [[5, 6], [1, 6]],
        [[7, 10], [5, 10]],
        [[7, 7], [2, 7]],
      ] as [Frac, Frac][]).map(([a, b]) => {
        const s = sumTask(a, b, '−');
        return field(s.text, frac(s.result));
      }),
    ),
    why: 'Mismo denominador: se restan los numeradores y el denominador se queda igual. [1/3] · [4/6] · [2/10] · [5/7].',
    source: 'Temario · Practica',
  }),
  fixed('suma-caramelos', 'suma', 'La bolsa de caramelos', {
    text: 'Me como [2/6] de una bolsa de caramelos y luego [1/6]. ¿Qué fracción de la bolsa me he comido?',
    body: fieldsBody([field(undefined, frac([3, 6]))]),
    why: '[2/6] + [1/6] = [3/6] (la mitad de la bolsa).',
    source: 'Temario · Practica',
  }),
  fixed('suma-limonada', 'suma', 'La jarra de limonada', {
    text: 'Me bebo [5/7] de una jarra de limonada y luego [2/7] más. ¿Qué fracción me queda en la jarra?',
    body: fieldsBody([field(undefined, frac([0, 7]))]),
    why: '[5/7] + [2/7] = [7/7]: ¡me he bebido la jarra entera! Queda [0/7], es decir, nada.',
    source: 'Temario · Practica',
  }),
];

// ---------- 7. Fracción de una cantidad ----------

const cantidad: TaskQuestion[] = [
  generated('cantidad-calcula', 'cantidad', 'Fracción de un número', (rng) => {
    const d = int(rng, 2, 10);
    const n = int(rng, 1, d - 1);
    const q = d * int(rng, 2, 12);
    return {
      text: 'Calcula. (Divide entre el de abajo y multiplica por el de arriba.)',
      body: fieldsBody([field(`${f([n, d])} de ${q}`, num(ofQty([n, d], q)))]),
      why: ofQtyWhy([n, d], q),
    };
  }),
  generated('cantidad-mental', 'cantidad', 'Cálculo mental con 100, 1000…', (rng) => {
    const [n, d] = pick(
      [
        [1, 2],
        [1, 4],
        [3, 4],
        [1, 5],
        [2, 5],
        [1, 10],
        [3, 10],
      ] as Frac[],
      rng,
    );
    const q = pick([100, 1000, 200, 2000, 400, 4000], rng);
    return {
      text: 'Cálculo mental.',
      body: fieldsBody([field(`${f([n, d])} de ${q}`, num(ofQty([n, d], q)))]),
      why: ofQtyWhy([n, d], q),
    };
  }),
  generated('cantidad-problema', 'cantidad', 'Problemas de fracción de una cantidad', (rng) => {
    const kind = int(rng, 0, 4);
    if (kind === 0) {
      const [n, d] = pick([[3, 8], [1, 4], [2, 3], [1, 6], [5, 8]] as Frac[], rng);
      const q = d * int(rng, 3, 5);
      return {
        text: `En una clase de ${q} alumnos, ${f([n, d])} llevan gafas. ¿Cuántos alumnos llevan gafas?`,
        body: fieldsBody([field(undefined, num(ofQty([n, d], q), 'alumnos'))]),
        why: ofQtyWhy([n, d], q),
      };
    }
    if (kind === 1) {
      const d = pick([2, 4, 5], rng);
      const q = d * 100 * int(rng, 2, 9);
      return {
        text: `Marta tiene ${f([1, d])} de una librería. Si las ganancias del mes han sido ${q} €, ¿cuánto le corresponde a Marta?`,
        body: fieldsBody([field(undefined, num(ofQty([1, d], q), '€'))]),
        why: ofQtyWhy([1, d], q),
      };
    }
    if (kind === 2) {
      const q = 3 * int(rng, 20, 70);
      return {
        text: `En una carrera participan ${q} atletas y ${f([1, 3])} son mujeres. ¿Cuántos hombres corrieron?`,
        body: fieldsBody([field(undefined, num(q - q / 3, 'hombres'))]),
        why: `Mujeres: ${q} : 3 = ${q / 3}. Hombres: ${q} − ${q / 3} = ${q - q / 3}. (También: los hombres son [2/3] → ${ofQtyWhy([2, 3], q)}.)`,
      };
    }
    if (kind === 3) {
      const [n, d] = pick([[2, 5], [3, 4], [1, 2], [3, 5], [1, 4]] as Frac[], rng);
      const q = d * 10 * int(rng, 1, 8);
      return {
        text: `Un depósito de ${q} litros marca ${f([n, d])}. ¿Cuántos litros quedan?`,
        body: fieldsBody([field(undefined, num(ofQty([n, d], q), 'litros'))]),
        why: ofQtyWhy([n, d], q),
      };
    }
    const q = 6 * int(rng, 10, 40);
    const a = int(rng, 1, 3);
    const b = int(rng, 1, 5 - a);
    return {
      text: `En mi hucha tengo ${q} €. Gasto ${f([a, 6])} en una entrada y ${f([b, 6])} en recuerdos.`,
      body: fieldsBody([
        field('Gasto en la entrada', num(ofQty([a, 6], q), '€')),
        field('Gasto en recuerdos', num(ofQty([b, 6], q), '€')),
        field('¿Cuánto dinero me queda?', num(q - ofQty([a + b, 6], q), '€')),
      ]),
      why: `${q} : 6 = ${q / 6} € cada sexto. Entrada: ${q / 6} × ${a} = ${ofQty([a, 6], q)} €. Recuerdos: ${q / 6} × ${b} = ${ofQty([b, 6], q)} €. Queda ${f([6 - a - b, 6])}: ${q / 6} × ${6 - a - b} = ${q - ofQty([a + b, 6], q)} €.`,
    };
  }),
  generated('cantidad-resto', 'cantidad', 'Qué fracción queda', (rng) => {
    const d = pick([5, 6, 8, 10], rng);
    const a = int(rng, 1, d - 2);
    const b = int(rng, 1, d - a - 1);
    return {
      text: `Gasto ${f([a, d])} de mi paga en un libro y ${f([b, d])} en chuches. ¿Qué fracción de la paga me queda?`,
      body: fieldsBody([field(undefined, frac([d - a - b, d]))]),
      why: `Gasto ${f([a, d])} + ${f([b, d])} = ${f([a + b, d])}. Toda la paga es ${f([d, d])}: queda ${f([d, d])} − ${f([a + b, d])} = ${f([d - a - b, d])}.`,
    };
  }),
  fixed('cantidad-mental-libro', 'cantidad', 'Cálculo mental con 1000', {
    text: 'Cálculo mental.',
    body: fieldsBody(([[1, 2], [1, 4], [3, 4]] as Frac[]).map((x) => field(`${f(x)} de 1000`, num(ofQty(x, 1000))))),
    why: '1000 : 2 = 500 · 1000 : 4 = 250 · 250 × 3 = 750.',
    source: 'Temario · Practica',
  }),
  fixed('cantidad-calcula-libro', 'cantidad', 'Fracciones de números grandes', {
    text: 'Calcula.',
    body: fieldsBody(
      ([
        [[1, 2], 2800],
        [[1, 4], 3200],
        [[2, 5], 3500],
      ] as [Frac, number][]).map(([x, q]) => field(`${f(x)} de ${q}`, num(ofQty(x, q)))),
    ),
    why: `${ofQtyWhy([1, 2], 2800)} · ${ofQtyWhy([1, 4], 3200)} · ${ofQtyWhy([2, 5], 3500)}.`,
    source: 'Temario · Practica',
  }),
  fixed('cantidad-hucha', 'cantidad', 'La hucha de 180 €', {
    text: 'En mi hucha tengo 180 €. Gasto [2/6] en una entrada al parque de atracciones y [1/6] en recuerdos.',
    body: fieldsBody([
      field('Gasto en la entrada', num(60, '€')),
      field('Gasto en recuerdos', num(30, '€')),
      field('¿Qué fracción me queda?', frac([3, 6])),
      field('¿Cuánto dinero me queda?', num(90, '€')),
    ]),
    why: '180 : 6 = 30 € cada sexto. Entrada: 30 × 2 = 60 €. Recuerdos: 30 €. Gasto [3/6], así que queda [3/6]: 30 × 3 = 90 €.',
    source: 'Temario · Practica',
  }),
  ...([
    [[1, 2], [48, 480, 4800, 4.8, 0.48]],
    [[2, 3], [6, 60, 600, 6000, 0.6]],
    [[3, 4], [8, 80, 800, 8000, 0.8]],
  ] as [Frac, number[]][]).map(([x, qs], i) =>
    fixed(`cantidad-patron-${i + 1}`, 'cantidad', `Patrones con ${x[0]}/${x[1]}`, {
      text: `Completa con patrones: ${f(x)} de…`,
      body: fieldsBody(qs.map((q) => field(`${f(x)} de ${numText(q)}`, num(ofQty(x, q))))),
      why: `${ofQtyWhy(x, qs[0]!)}. Si el número es 10 veces mayor, el resultado también: ${qs.map((q) => numText(ofQty(x, q))).join(' · ')}.`,
      source: 'Temario · Practica',
    }),
  ),
  fixed('cantidad-clase', 'cantidad', 'Se van 3/4 de la clase', {
    text: 'Mi clase tiene 24 alumnos y se van [3/4].',
    body: fieldsBody([field('¿Cuántos se han ido?', num(18)), field('¿Cuántos quedan?', num(6))]),
    why: `${ofQtyWhy([3, 4], 24)} se han ido. Quedan 24 − 18 = 6 (o [1/4] de 24 = 6).`,
    source: 'Temario · Practica',
  }),
  fixed('cantidad-carrera', 'cantidad', 'Los 186 atletas', {
    text: 'En una carrera participan 186 atletas y [1/3] son mujeres. De todos, [1/6] no acabó la carrera.',
    body: fieldsBody([field('¿Cuántos hombres corrieron?', num(124)), field('¿Cuántos terminaron la carrera?', num(155))]),
    why: 'Mujeres: 186 : 3 = 62, así que hombres: 186 − 62 = 124. No acabaron: 186 : 6 = 31, así que terminaron 186 − 31 = 155.',
    source: 'Temario · Practica',
  }),
  fixed('cantidad-huerto', 'cantidad', 'El depósito del huerto', {
    text: 'En un huerto hay un depósito de 4000 litros. Con [4/8] riegan las verduras y con [3/8] los árboles.',
    body: fieldsBody([
      field('Litros para las verduras', num(2000, 'litros')),
      field('Litros para los árboles', num(1500, 'litros')),
      field('Litros que sobran', num(500, 'litros')),
    ]),
    why: 'Cada parte: 4000 : 8 = 500 litros. Verduras: 500 × 4 = 2000. Árboles: 500 × 3 = 1500. Sobra [1/8]: 500 litros (o 4000 − 2000 − 1500).',
    source: 'Ejemplo del libro',
  }),
];

export const PRACTICE: TaskQuestion[] = [...que, ...leer, ...dec, ...equiv, ...orden, ...suma, ...cantidad];
