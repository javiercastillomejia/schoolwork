import { equivalent, f, gcd as gcdOf, numText, type Frac } from '../lib/frac';
import { shuffle, type Rng } from '../lib/random';

/**
 * Un ejercicio que se le pone al alumno. Las preguntas de elegir de Natural
 * Science y todos los ejercicios de Matemáticas (escribir una fracción,
 * comparar, ordenar, colorear, unir parejas…) son tareas.
 *
 * Los textos admiten **negritas** y fracciones con corchetes: [3/4], números
 * mixtos [2 3/4] y huecos [?/8].
 */
export type Rich = string;

export type Shape = 'bar' | 'circle' | 'dots' | 'squares';

export type Figure =
  /** Figura partida en `parts` trozos iguales con `filled` coloreados. */
  | { kind: 'shape'; shape: Shape; parts: number; filled: number }
  /** Recta numérica del 0 al 1 partida en `parts`, con puntos marcados. */
  | { kind: 'line'; parts: number; points: { label: string; at: number }[] };

export type Expect =
  /** Un número (entero o decimal: vale "0,5" y "0.5"). */
  | { type: 'number'; value: number; unit?: string }
  /**
   * Una fracción. `exact`: esa misma; `equivalent`: cualquiera equivalente;
   * `amplify` / `simplify`: equivalente con términos mayores / menores.
   */
  | { type: 'fraction'; n: number; d: number; mode: 'exact' | 'equivalent' | 'amplify' | 'simplify' }
  /** Número mixto (la parte de fracción puede ser equivalente). */
  | { type: 'mixed'; whole: number; n: number; d: number };

export interface Field {
  label?: Rich;
  figure?: Figure;
  expect: Expect;
}

export interface ColorTarget {
  shape: Shape;
  parts: number;
  target: number;
  label?: Rich;
}

export type Body =
  /** Elegir una opción. */
  | { type: 'choice'; options: Rich[]; correct: Rich }
  /** Casillas para escribir. `distinct`: no vale repetir; `sameDenominator`: todas con el mismo denominador. */
  | { type: 'fields'; fields: Field[]; distinct?: boolean; sameDenominator?: boolean }
  /** Varias filas, cada una con sus opciones (p. ej., comparar con <, = o >). */
  | { type: 'rows'; rows: { label: Rich; options: string[]; answer: number }[] }
  /** Ordenar fracciones tocándolas en orden. */
  | { type: 'order'; items: Frac[]; dir: 'asc' | 'desc' }
  /** Clasificar cada fracción en un grupo. */
  | { type: 'classify'; items: Frac[]; bins: string[]; answers: number[] }
  /** Unir parejas (de fracciones equivalentes). */
  | { type: 'pairs'; items: Frac[]; pairs: [number, number][] }
  /** Colorear (o rodear) la parte que se pide. */
  | { type: 'color'; figures: ColorTarget[] };

export interface Task {
  text: Rich;
  figure?: Figure;
  body: Body;
  /** Explicación o solución paso a paso (se enseña al corregir). */
  why: Rich;
  /** De dónde sale, p. ej. "Hoja de repaso · ejercicio 7". */
  source?: string;
}

export type Response =
  | { type: 'choice'; value: string | null }
  | { type: 'fields'; values: string[][] }
  | { type: 'rows'; values: (number | null)[] }
  | { type: 'order'; value: number[] }
  | { type: 'classify'; values: (number | null)[] }
  | { type: 'pairs'; partner: number[] }
  | { type: 'color'; values: boolean[][] };

/** Casillas que tiene cada tipo de respuesta: número 1, fracción 2, mixto 3. */
export function slots(expect: Expect): number {
  return expect.type === 'number' ? 1 : expect.type === 'fraction' ? 2 : 3;
}

export function emptyResponse(task: Task): Response {
  const body = task.body;
  switch (body.type) {
    case 'choice':
      return { type: 'choice', value: null };
    case 'fields':
      return { type: 'fields', values: body.fields.map((field) => Array.from({ length: slots(field.expect) }, () => '')) };
    case 'rows':
      return { type: 'rows', values: body.rows.map(() => null) };
    case 'order':
      return { type: 'order', value: [] };
    case 'classify':
      return { type: 'classify', values: body.items.map(() => null) };
    case 'pairs':
      return { type: 'pairs', partner: body.items.map(() => -1) };
    case 'color':
      return { type: 'color', values: body.figures.map((fig) => Array.from({ length: fig.parts }, () => false)) };
  }
}

/** Ya se puede comprobar: todo contestado. */
export function isComplete(task: Task, response: Response): boolean {
  const body = task.body;
  if (body.type === 'choice' && response.type === 'choice') return response.value !== null;
  if (body.type === 'fields' && response.type === 'fields') return response.values.every((v) => v.every((s) => s.trim() !== ''));
  if (body.type === 'rows' && response.type === 'rows') return response.values.every((v) => v !== null);
  if (body.type === 'order' && response.type === 'order') return response.value.length === body.items.length;
  if (body.type === 'classify' && response.type === 'classify') return response.values.every((v) => v !== null);
  if (body.type === 'pairs' && response.type === 'pairs') return response.partner.every((p) => p >= 0);
  if (body.type === 'color' && response.type === 'color') return response.values.some((fig) => fig.some(Boolean));
  return false;
}

/** "0,5", "0.5", "15 €", " 20 " → número; null si no es un número. */
export function parseNumber(raw: string): number | null {
  const clean = raw.replace(/\s/g, '').replace(/[€a-zA-Z]+$/u, '').replace(',', '.');
  if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(clean)) return null;
  return Number(clean);
}

function parseInt10(raw: string): number | null {
  const n = parseNumber(raw);
  return n !== null && Number.isInteger(n) ? n : null;
}

function checkFraction(expect: Extract<Expect, { type: 'fraction' }>, n: number, d: number): boolean {
  if (d <= 0) return false;
  const same = equivalent([n, d], [expect.n, expect.d]);
  switch (expect.mode) {
    case 'exact':
      return n === expect.n && d === expect.d;
    case 'equivalent':
      return same;
    case 'amplify':
      return same && d > expect.d;
    case 'simplify':
      return same && d < expect.d;
  }
}

/** ¿Está bien una casilla? */
export function checkField(expect: Expect, values: string[]): boolean {
  if (expect.type === 'number') {
    const n = parseNumber(values[0] ?? '');
    return n !== null && Math.abs(n - expect.value) < 0.0051;
  }
  if (expect.type === 'fraction') {
    const n = parseInt10(values[0] ?? '');
    const d = parseInt10(values[1] ?? '');
    return n !== null && d !== null && checkFraction(expect, n, d);
  }
  const whole = parseInt10(values[0] ?? '');
  const n = parseInt10(values[1] ?? '');
  const d = parseInt10(values[2] ?? '');
  return whole === expect.whole && n !== null && d !== null && d > 0 && n < d && equivalent([n, d], [expect.n, expect.d]);
}

export interface Checked {
  correct: boolean;
  /** Si está bien cada parte (casilla, fila, fracción, figura…), en orden. */
  parts: boolean[];
}

export function checkTask(task: Task, response: Response): Checked {
  const body = task.body;
  let parts: boolean[] = [];
  if (body.type === 'choice' && response.type === 'choice') {
    parts = [response.value === body.correct];
  } else if (body.type === 'fields' && response.type === 'fields') {
    parts = body.fields.map((field, i) => checkField(field.expect, response.values[i] ?? []));
    const fracs = response.values.map((v) => v.join('/'));
    if (body.distinct && new Set(fracs).size < fracs.length) {
      // Repetidas: solo cuenta la primera.
      const seen = new Set<string>();
      parts = parts.map((ok, i) => {
        const key = fracs[i]!;
        const dup = seen.has(key);
        seen.add(key);
        return ok && !dup;
      });
    }
    if (body.sameDenominator) {
      const dens = response.values.map((v) => v[1]?.trim());
      if (new Set(dens).size > 1) parts = parts.map(() => false);
    }
  } else if (body.type === 'rows' && response.type === 'rows') {
    parts = body.rows.map((row, i) => response.values[i] === row.answer);
  } else if (body.type === 'order' && response.type === 'order') {
    const expected = orderedIndexes(body.items, body.dir);
    parts = response.value.map((idx, pos) => {
      const want = body.items[expected[pos]!]!;
      const got = body.items[idx]!;
      return equivalent(want, got);
    });
  } else if (body.type === 'classify' && response.type === 'classify') {
    parts = body.answers.map((answer, i) => response.values[i] === answer);
  } else if (body.type === 'pairs' && response.type === 'pairs') {
    parts = body.items.map((_, i) => {
      const p = response.partner[i] ?? -1;
      return p >= 0 && body.pairs.some(([a, b]) => (a === i && b === p) || (b === i && a === p));
    });
  } else if (body.type === 'color' && response.type === 'color') {
    parts = body.figures.map((fig, i) => (response.values[i] ?? []).filter(Boolean).length === fig.target);
  }
  return { correct: parts.length > 0 && parts.every(Boolean), parts };
}

/** Índices de `items` en el orden pedido (de menor a mayor o al revés). */
export function orderedIndexes(items: Frac[], dir: 'asc' | 'desc'): number[] {
  const idx = items.map((_, i) => i);
  idx.sort((a, b) => {
    const [an, ad] = items[a]!;
    const [bn, bd] = items[b]!;
    return dir === 'asc' ? an * bd - bn * ad : bn * ad - an * bd;
  });
  return idx;
}

/** La respuesta buena de una casilla, como texto enriquecido. */
export function expectText(expect: Expect): Rich {
  if (expect.type === 'number') return `${numText(expect.value)}${expect.unit ? ` ${expect.unit}` : ''}`;
  if (expect.type === 'fraction') {
    const base = f([expect.n, expect.d]);
    if (expect.mode === 'amplify') return `por ejemplo, ${f([expect.n * 2, expect.d * 2])}`;
    if (expect.mode === 'simplify') return `por ejemplo, ${simplestText(expect.n, expect.d)}`;
    return base;
  }
  return `[${expect.whole} ${expect.n}/${expect.d}]`;
}

function simplestText(n: number, d: number): Rich {
  for (const k of [2, 3, 5, 7]) if (n % k === 0 && d % k === 0) return f([n / k, d / k]);
  return f([n, d]);
}

/** Todas las respuestas buenas de la tarea, para la corrección. */
export function answerText(task: Task): Rich {
  const body = task.body;
  switch (body.type) {
    case 'choice':
      return body.correct;
    case 'fields':
      return body.fields.map((field) => (field.label ? `${field.label} → ${expectText(field.expect)}` : expectText(field.expect))).join(' · ');
    case 'rows':
      return body.rows
        .map((row) => {
          const option = row.options[row.answer] ?? '';
          return row.label.includes('○') ? row.label.replace('○', option) : `${row.label.replace(/…$/, '')} **${option.toLowerCase()}**`;
        })
        .join(' · ');
    case 'order': {
      const sign = body.dir === 'asc' ? ' < ' : ' > ';
      return orderedIndexes(body.items, body.dir)
        .map((i) => f(body.items[i]!))
        .join(sign);
    }
    case 'classify':
      return body.bins
        .map((bin, b) => {
          const items = body.items.filter((_, i) => body.answers[i] === b).map(f);
          return `**${bin}:** ${items.length > 0 ? items.join(' ') : 'ninguna'}`;
        })
        .join(' · ');
    case 'pairs':
      return body.pairs.map(([a, b]) => `${f(body.items[a]!)} y ${f(body.items[b]!)}`).join(' · ');
    case 'color':
      return body.figures.map((fig) => `${fig.target} de ${fig.parts}`).join(' · ');
  }
}

/** La respuesta buena, montada (para los tests). */
export function solvedResponse(task: Task): Response {
  const body = task.body;
  switch (body.type) {
    case 'choice':
      return { type: 'choice', value: body.correct };
    case 'fields': {
      // Con "mismo denominador", todas se escriben con el mínimo común denominador.
      const common = body.sameDenominator
        ? body.fields.reduce((m, { expect }) => (expect.type === 'fraction' ? (m * expect.d) / gcdOf(m, expect.d) : m), 1)
        : 0;
      return {
        type: 'fields',
        values: body.fields.map(({ expect }, i) => {
          if (common && expect.type === 'fraction') return [String((expect.n * common) / expect.d), String(common)];
          if (expect.type === 'number') return [String(expect.value)];
          if (expect.type === 'mixed') return [String(expect.whole), String(expect.n), String(expect.d)];
          const k = expect.mode === 'amplify' ? 2 + i : 1;
          if (expect.mode === 'simplify') {
            const divisors = Array.from({ length: expect.d }, (_, k) => k + 2).filter((s) => expect.n % s === 0 && expect.d % s === 0);
            const s = divisors[i % Math.max(1, divisors.length)] ?? 1;
            return [String(expect.n / s), String(expect.d / s)];
          }
          return [String(expect.n * k), String(expect.d * k)];
        }),
      };
    }
    case 'rows':
      return { type: 'rows', values: body.rows.map((row) => row.answer) };
    case 'order':
      return { type: 'order', value: orderedIndexes(body.items, body.dir) };
    case 'classify':
      return { type: 'classify', values: [...body.answers] };
    case 'pairs': {
      const partner = body.items.map(() => -1);
      for (const [a, b] of body.pairs) {
        partner[a] = b;
        partner[b] = a;
      }
      return { type: 'pairs', partner };
    }
    case 'color':
      return { type: 'color', values: body.figures.map((fig) => Array.from({ length: fig.parts }, (_, i) => i < fig.target)) };
  }
}

/** Una pregunta de elegir con `count` opciones al azar (la buena siempre incluida). */
export function choiceTask(text: Rich, correct: Rich, wrong: Rich[], why: Rich, count: number, rng: Rng): Task {
  const picked = shuffle(wrong, rng).slice(0, Math.max(1, count - 1));
  return { text, body: { type: 'choice', options: shuffle([correct, ...picked], rng), correct }, why };
}
