import { VERBS, pastLabel, type Verb } from '../data/verbs';
import { editDistance, normalize, splitForms } from '../lib/text';

export type MistakeKind =
  | 'empty'
  | 'missingForm'
  | 'otherValid'
  | 'regularized'
  | 'infinitive'
  | 'otherVerb'
  | 'typo'
  | 'wrong';

export type Verdict =
  | { correct: true }
  | {
      correct: false;
      kind: MistakeKind;
      /** Explicación corta para mostrar al alumno. */
      message: string;
      /** La forma correcta más parecida a lo que escribió (para marcar las letras). */
      closest: string;
      /** Lo que escribió, ya normalizado. */
      given: string;
    };

/** El "error típico": tratar el verbo como si fuera regular (bringed, buyed, cutted). */
export function regularize(base: string): string {
  if (base.endsWith('e')) return `${base}d`;
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(base)) return `${base}${base.slice(-1)}ed`;
  return `${base}ed`;
}

/** Comprueba el past simple escrito por el alumno. Solo se aceptan las formas de la hoja. */
export function checkPast(verb: Verb, input: string): Verdict {
  const given = normalize(input);
  const forms = splitForms(given);
  const accepted = new Set(verb.past);

  if (forms.length === 0) {
    return fail('empty', 'No has escrito nada.', verb.past[0] ?? '', given);
  }

  if (verb.needsAll) {
    const unique = new Set(forms);
    const allAccepted = [...unique].every((f) => accepted.has(f));
    if (allAccepted && unique.size === accepted.size) return { correct: true };
    if (allAccepted) {
      return fail('missingForm', `Te falta una forma: son dos, ${pastLabel(verb)}.`, pastLabel(verb), given);
    }
  } else if (forms.every((f) => accepted.has(f))) {
    return { correct: true };
  }

  const attempt = forms.find((f) => !accepted.has(f)) ?? forms[0] ?? given;
  const closest = closestForm(verb, attempt);

  if (verb.otherValid.includes(attempt)) {
    return fail(
      'otherValid',
      `«${attempt}» también existe, pero en tu hoja aparece «${pastLabel(verb)}». Apréndete esa.`,
      closest,
      attempt,
    );
  }
  if (attempt === regularize(verb.base) || attempt === `${verb.base}ed` || attempt === `${verb.base}d`) {
    return fail('regularized', '¡Ojo! Es un verbo irregular: no se le añade -ed.', closest, attempt);
  }
  if (attempt === verb.base) {
    return fail('infinitive', 'Has escrito el infinitivo. Necesitamos el pasado.', closest, attempt);
  }
  const owner = VERBS.find((other) => other.id !== verb.id && other.past.includes(attempt));
  if (owner) {
    return fail('otherVerb', `«${attempt}» es el pasado de «to ${owner.base}».`, closest, attempt);
  }
  const distance = editDistance(attempt, closest);
  if (distance === 1 || (distance === 2 && closest.length >= 7)) {
    return fail('typo', '¡Casi! Revisa cómo se escribe.', closest, attempt);
  }
  return fail('wrong', 'No es correcto.', closest, attempt);
}

function closestForm(verb: Verb, attempt: string): string {
  if (verb.needsAll) return pastLabel(verb);
  let best = verb.past[0] ?? '';
  let bestDistance = Infinity;
  for (const form of verb.past) {
    const distance = editDistance(attempt, form);
    if (distance < bestDistance) {
      best = form;
      bestDistance = distance;
    }
  }
  return best;
}

function fail(kind: MistakeKind, message: string, closest: string, given: string): Verdict {
  return { correct: false, kind, message, closest, given };
}
