import type { QuestionKind } from './srs';

/**
 * Cómo se adapta la app a la edad:
 *  - hasta 10 años: más ayuda (más preguntas de elegir antes de escribir,
 *    3 verbos nuevos por sesión y pista con la primera letra),
 *  - de 11 a 13: lo normal,
 *  - 14 o más: se pasa antes a escribir.
 */
export interface LearnerProfile {
  /** Verbos nuevos por sesión. */
  newPerSession: number;
  /** Hasta qué caja se pregunta eligiendo entre opciones (0 = siempre escribir). */
  choiceUpToBox: number;
  /** Mostrar la primera letra como pista al escribir. */
  firstLetterHint: boolean;
}

export const MIN_AGE = 8;
export const MAX_AGE = 16;
export const DEFAULT_AGE = 12;

export function profileForAge(age: number | null | undefined): LearnerProfile {
  const years = age ?? DEFAULT_AGE;
  if (years <= 10) return { newPerSession: 3, choiceUpToBox: 2, firstLetterHint: true };
  if (years >= 14) return { newPerSession: 4, choiceUpToBox: 0, firstLetterHint: false };
  return { newPerSession: 4, choiceUpToBox: 1, firstLetterHint: false };
}

/** Qué tipo de pregunta toca según la caja y el perfil: primero reconocer, luego escribir. */
export function kindFor(profile: LearnerProfile, box: number): QuestionKind {
  return box <= profile.choiceUpToBox ? 'choice' : 'write';
}
