/** Ayudas con fracciones: máximo común divisor, comparar y leerlas en voz alta. */

export type Frac = [number, number];

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

export function simplest([n, d]: Frac): Frac {
  const g = gcd(n, d);
  return [n / g, d / g];
}

export function equivalent([a, b]: Frac, [c, d]: Frac): boolean {
  return a * d === b * c;
}

export function value([n, d]: Frac): number {
  return n / d;
}

/** "3/4" */
export function fracText([n, d]: Frac): string {
  return `${n}/${d}`;
}

/** Marca de fracción para el texto enriquecido: "[3/4]". */
export function f([n, d]: Frac): string {
  return `[${n}/${d}]`;
}

/** Número con coma decimal, sin ceros de más: 0,25 · 15 · 333,33 */
export function numText(x: number): string {
  const rounded = Math.round(x * 1000) / 1000;
  return String(rounded).replace('.', ',');
}

// ---------- Leer en voz alta ----------

const UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

/** Número en palabras (hasta 999 999). */
export function numberWords(n: number): string {
  if (n < 30) return UNITS[n] ?? String(n);
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? TENS[t]! : `${TENS[t]} y ${UNITS[u]}`;
  }
  if (n === 100) return 'cien';
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return rest === 0 ? HUNDREDS[h]! : `${HUNDREDS[h]} ${numberWords(rest)}`;
  }
  if (n < 1_000_000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    const head = th === 1 ? 'mil' : `${numberWords(th).replace(/uno$/, 'ún')} mil`;
    return rest === 0 ? head : `${head} ${numberWords(rest)}`;
  }
  return String(n);
}

const DENOMINATORS: Record<number, string> = {
  2: 'medio',
  3: 'tercio',
  4: 'cuarto',
  5: 'quinto',
  6: 'sexto',
  7: 'séptimo',
  8: 'octavo',
  9: 'noveno',
  10: 'décimo',
  100: 'centésimo',
  1000: 'milésimo',
};

/** Nombre del denominador en singular: 2 → medio, 12 → doceavo. */
export function denominatorWord(d: number): string {
  const known = DENOMINATORS[d];
  if (known) return known;
  // A partir del 11 se añade -avo: onceavo, doceavo, dieciochoavo, veinticuatroavo…
  const base = numberWords(d)
    .replace(/ y /g, 'i')
    .replace(/ /g, '')
    .normalize('NFD')
    .replace(/\u0301/g, '');
  return `${base}avo`;
}

/** "un cuarto", "tres cuartos", "cinco doceavos" */
export function fractionWords([n, d]: Frac): string {
  const name = denominatorWord(d);
  if (n === 1) return `un ${name}`;
  return `${numberWords(n)} ${name}s`;
}
