import { VERBS, type Verb } from '../data/verbs';
import { pick, shuffle, type Rng } from '../lib/random';
import { editDistance } from '../lib/text';
import { regularize } from './answers';

export interface ChoiceOptions {
  options: string[];
  correct: string;
}

/** Casos donde las reglas automáticas no dan opciones creíbles. */
const OVERRIDES: Record<string, string[]> = {
  be: ['is/are', 'was/are', 'bed'],
};

const ALL_PASTS = [...new Set(VERBS.flatMap((verb) => verb.past))];

/**
 * Cuatro opciones de past simple: la correcta y tres errores creíbles, por
 * orden de preferencia:
 *  1. la forma "regular" inventada (bringed, buyed, cutted),
 *  2. el past de otro verbo que se escribe parecido (brought ↔ bought),
 *  3. confusiones de ortografía o con el infinitivo (braught, thougth, choose),
 *  4. cambios de vocal de otras familias (brang, drave),
 *  y, si aún faltan, pasados de otros verbos al azar.
 */
export function pastChoices(verb: Verb, rng: Rng = Math.random): ChoiceOptions {
  const correct = verb.needsAll ? verb.past.join('/') : pick(verb.past, rng);
  const forbidden = new Set([...verb.past, ...verb.otherValid, correct]);
  const chosen: string[] = [];
  const take = (candidate: string | undefined) => {
    if (!candidate || chosen.length >= 3) return;
    if (forbidden.has(candidate) || chosen.includes(candidate)) return;
    if (!/^[a-z/]+$/.test(candidate)) return;
    chosen.push(candidate);
  };

  for (const candidate of OVERRIDES[verb.base] ?? []) take(candidate);

  take(regularize(verb.base));

  const similarPasts = shuffle(nearbyPasts(verb), rng);
  take(similarPasts[0]);

  const strong = shuffle(confusions(verb), rng);
  const vowels = shuffle(vowelChanges(verb), rng);
  take(strong[0] ?? vowels[0]);

  for (const candidate of shuffle([...similarPasts.slice(1), ...strong.slice(1)], rng)) take(candidate);
  for (const candidate of vowels) take(candidate);
  for (const candidate of shuffle(ALL_PASTS, rng)) take(candidate);

  return { options: shuffle([correct, ...chosen], rng), correct };
}

/** Pasados de otros verbos que se escriben parecido (distancia ≤ 2). */
function nearbyPasts(verb: Verb): string[] {
  return ALL_PASTS.filter((other) => {
    if (verb.past.includes(other)) return false;
    return verb.past.some((form) => editDistance(form, other) <= 2);
  });
}

/** Confusiones habituales: -ough/-augh, -gth y el infinitivo en lugar del pasado (choose ↔ chose). */
function confusions(verb: Verb): string[] {
  const out = new Set<string>();
  for (const form of verb.past) {
    if (form.includes('ough')) out.add(form.replace('ough', 'augh'));
    if (form.includes('augh')) out.add(form.replace('augh', 'ough'));
    if (form.endsWith('ght')) out.add(`${form.slice(0, -3)}gth`);
  }
  if (!verb.past.includes(verb.base)) out.add(verb.base);
  return [...out];
}

/** Palabras que no deben salir nunca como opción. */
const BLOCKLIST = new Set(['shat']);

/** Cambio de vocal como el de otras familias: brang, brong, drave, chase… */
function vowelChanges(verb: Verb): string[] {
  const { base } = verb;
  const magicE = /[^aeiou]e$/.test(base) && base.length > 3;
  const stem = magicE ? base.slice(0, -1) : base;
  const out = new Set<string>();
  for (const vowel of ['a', 'o']) {
    const changed = replaceLastVowelGroup(stem, vowel);
    if (!changed || changed === stem) continue;
    const word = magicE ? `${changed}e` : changed;
    if (word.length >= 3 && !BLOCKLIST.has(word)) out.add(word);
  }
  return [...out];
}

function replaceLastVowelGroup(word: string, vowel: string): string | null {
  const matches = [...word.matchAll(/[aeiou]+/g)];
  const last = matches[matches.length - 1];
  if (!last || last.index === undefined) return null;
  return word.slice(0, last.index) + vowel + word.slice(last.index + last[0].length);
}
