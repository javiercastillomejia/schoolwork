/** Minúsculas, sin espacios sobrantes, sin "to " delante y sin puntuación final. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^to\s+/, '')
    .replace(/[.!?;:]+$/, '')
    .trim();
}

/** Separa respuestas con varias formas: "was/were", "was, were", "was or were", "was y were". */
export function splitForms(normalized: string): string[] {
  return normalized
    .replace(/\s+(?:or|and|y|o)\s+/g, ' ')
    .split(/[\s,/]+/)
    .filter(Boolean);
}

/**
 * Distancia de edición que cuenta el intercambio de dos letras vecinas como un
 * solo error (brougth → brought = 1).
 */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i]![0] = i;
  for (let j = 0; j < cols; j++) d[0]![j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = best;
    }
  }
  return d[a.length]![b.length]!;
}
