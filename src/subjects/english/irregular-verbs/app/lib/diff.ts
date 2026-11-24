export interface DiffPart {
  text: string;
  /** true si estas letras no coinciden con la otra palabra. */
  changed: boolean;
}

/**
 * Compara la respuesta con la solución letra a letra (subsecuencia común más
 * larga) y marca qué letras sobran en `answer` y cuáles faltan en `solution`.
 */
export function diffWords(answer: string, solution: string): { answer: DiffPart[]; solution: DiffPart[] } {
  const n = answer.length;
  const m = solution.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] =
        answer[i] === solution[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const answerMask: boolean[] = [];
  const solutionMask: boolean[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (answer[i] === solution[j]) {
      answerMask.push(false);
      solutionMask.push(false);
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      answerMask.push(true);
      i++;
    } else {
      solutionMask.push(true);
      j++;
    }
  }
  while (i++ < n) answerMask.push(true);
  while (j++ < m) solutionMask.push(true);
  return { answer: group(answer, answerMask), solution: group(solution, solutionMask) };
}

function group(text: string, mask: boolean[]): DiffPart[] {
  const parts: DiffPart[] = [];
  for (let k = 0; k < text.length; k++) {
    const changed = mask[k] ?? false;
    const last = parts[parts.length - 1];
    if (last && last.changed === changed) last.text += text[k];
    else parts.push({ text: text[k] as string, changed });
  }
  return parts;
}
