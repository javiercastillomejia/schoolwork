import type { ListItem, RichText, StudyBlock } from '../core/types';
import { fractionWords, numberWords } from './frac';

export type Segment =
  | { kind: 'text'; text: string; bold: boolean }
  /** Fracción: [3/4], número mixto [2 3/4] o con hueco [?/8] (null = hueco). */
  | { kind: 'frac'; whole: number | null; n: number | null; d: number | null; bold: boolean };

const FRACTION = /\[(?:(\d+) )?(\d+|\?)\/(\d+|\?)\]/g;

function splitFractions(text: string, bold: boolean): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(FRACTION)) {
    const at = match.index ?? 0;
    if (at > last) out.push({ kind: 'text', text: text.slice(last, at), bold });
    const num = (s: string | undefined) => (s === undefined || s === '?' ? null : Number(s));
    out.push({ kind: 'frac', whole: match[1] ? Number(match[1]) : null, n: num(match[2]), d: num(match[3]), bold });
    last = at + match[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last), bold });
  return out;
}

/** Parte un texto con **negritas** y [fracciones] en trozos. */
export function parseRich(text: RichText): Segment[] {
  const out: Segment[] = [];
  const parts = text.split('**');
  parts.forEach((part, i) => {
    if (part === '') return;
    // Si quedan asteriscos sin cerrar, el último trozo se deja normal.
    const bold = i % 2 === 1 && i < parts.length - 1;
    out.push(...splitFractions(part, bold));
  });
  return out;
}

/**
 * El texto sin marcas, para leerlo en voz alta o buscar en él. En español las
 * fracciones se dicen con palabras ("tres cuartos") y los signos también.
 */
export function plain(text: RichText, lang = 'en-GB'): string {
  const spanish = lang.startsWith('es');
  return parseRich(text)
    .map((s) => {
      if (s.kind === 'text') {
        return spanish
          ? s.text
              .replace(/ ○ /g, ' comparado con ')
              .replace(/ < /g, ' es menor que ')
              .replace(/ > /g, ' es mayor que ')
              .replace(/ − /g, ' menos ')
              .replace(/ \+ /g, ' más ')
              .replace(/ × /g, ' por ')
              .replace(/ : /g, ' entre ')
          : s.text;
      }
      if (!spanish) return `${s.whole !== null ? `${s.whole} ` : ''}${s.n ?? '?'}/${s.d ?? '?'}`;
      const whole = s.whole !== null ? `${numberWords(s.whole)} y ` : '';
      if (s.n === null || s.d === null) return `${whole}una fracción con un hueco`;
      return whole + fractionWords([s.n, s.d]);
    })
    .join('');
}

function listText(item: ListItem, lang: string): string[] {
  if (typeof item === 'string') return [plain(item, lang)];
  return [plain(item.text, lang), ...item.items.flatMap((i) => listText(i, lang))];
}

/** Lo que se lee en voz alta de cada bloque de una ficha (las notas para la familia, no). */
export function blockSpeech(block: StudyBlock, lang = 'en-GB'): string[] {
  const p = (t: string) => plain(t, lang);
  switch (block.type) {
    case 'heading':
    case 'p':
    case 'tip':
      return [p(block.text)];
    case 'list':
      return block.items.flatMap((i) => listText(i, lang));
    case 'table':
      return block.rows.map((row) => row.map(p).join('. '));
    case 'pairs':
      return [...(block.title ? [p(block.title)] : []), ...block.items.map(([a, b]) => `${p(a)}: ${p(b)}`)];
    case 'steps':
      return [...(block.title ? [p(block.title)] : []), block.items.map(p).join('. ')];
    case 'dialogue':
      return block.lines.map((line) => (line.who ? `${line.who}: ${p(line.text)}` : p(line.text)));
    case 'tree':
      return listText(block.root, lang);
    case 'figure':
      return block.caption ? [p(block.caption)] : [];
    case 'note':
      return [];
  }
}

/** Plural sencillo: "1 hoja", "3 hojas". */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
