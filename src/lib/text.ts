import type { ListItem, RichText, StudyBlock } from '../core/types';

export interface Segment {
  text: string;
  bold: boolean;
}

/** Parte un texto con **negritas** en trozos normales y resaltados. */
export function parseRich(text: RichText): Segment[] {
  const out: Segment[] = [];
  const parts = text.split('**');
  parts.forEach((part, i) => {
    if (part === '') return;
    // Si quedan asteriscos sin cerrar, el último trozo se deja normal.
    const bold = i % 2 === 1 && i < parts.length - 1;
    out.push({ text: part, bold });
  });
  return out;
}

/** El texto sin marcas, para leerlo en voz alta o buscar en él. */
export function plain(text: RichText): string {
  return text.replace(/\*\*/g, '');
}

function listText(item: ListItem): string[] {
  if (typeof item === 'string') return [plain(item)];
  return [plain(item.text), ...item.items.flatMap(listText)];
}

/** Lo que se lee en voz alta de cada bloque de una ficha (las notas en español, no). */
export function blockSpeech(block: StudyBlock): string[] {
  switch (block.type) {
    case 'heading':
    case 'p':
    case 'tip':
      return [plain(block.text)];
    case 'list':
      return block.items.flatMap(listText);
    case 'table':
      return block.rows.map((row) => row.map(plain).join('. '));
    case 'pairs':
      return [...(block.title ? [plain(block.title)] : []), ...block.items.map(([a, b]) => `${a}: ${b}`)];
    case 'steps':
      return [...(block.title ? [plain(block.title)] : []), block.items.map(plain).join('. ')];
    case 'dialogue':
      return block.lines.map((line) => (line.who ? `${line.who}: ${plain(line.text)}` : plain(line.text)));
    case 'tree':
      return listText(block.root);
    case 'note':
      return [];
  }
}

/** Plural sencillo: "1 hoja", "3 hojas". */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
