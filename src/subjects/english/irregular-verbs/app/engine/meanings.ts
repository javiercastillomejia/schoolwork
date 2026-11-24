import type { Verb } from '../data/verbs';

/**
 * Significados de un verbo tal y como vienen en la hoja, separados:
 * "empezar/comenzar" → empezar, comenzar; "dejar (permitir)" → dejar, permitir.
 */
export function meaningOptions(verb: Verb): string[] {
  return verb.meaning
    .split('/')
    .flatMap((part) => {
      const match = /^(.*?)\s*\((.+)\)\s*$/.exec(part.trim());
      return match ? [match[1] ?? '', match[2] ?? ''] : [part];
    })
    .map((option) => option.trim())
    .filter(Boolean);
}

/** Minúsculas, sin tildes, sin espacios sobrantes ni puntuación final. */
export function normalizeSpanish(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?;:]+$/, '')
    .trim();
}

export interface MeaningVerdict {
  correct: boolean;
  /** Los otros significados válidos que no ha escrito ("también: llevar"). */
  others: string[];
}

/**
 * Vale cualquiera de los significados de la hoja, sin fijarse en mayúsculas ni
 * tildes. También se aceptan varios a la vez ("empezar/comenzar") si todos
 * son de la hoja.
 */
export function checkMeaning(verb: Verb, input: string): MeaningVerdict {
  const options = meaningOptions(verb);
  const valid = new Map(options.map((option) => [normalizeSpanish(option), option]));
  const parts = normalizeSpanish(input)
    .split(/\s*[,/;]\s*|\s+o\s+|\s+y\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const correct = parts.length > 0 && parts.every((part) => valid.has(part));
  const typed = new Set(parts);
  return { correct, others: options.filter((option) => !typed.has(normalizeSpanish(option))) };
}
