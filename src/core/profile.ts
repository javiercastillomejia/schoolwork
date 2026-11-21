/**
 * Cómo se adapta la app a la edad:
 *  - hasta 8 años: 3 opciones por pregunta, retos más cortos y pistas;
 *  - de 9 a 10: 4 opciones, 10 preguntas por tema y pistas;
 *  - de 11 a 12: más preguntas nuevas al día y sin pistas;
 *  - 13 o más: el ritmo más rápido.
 */
export interface LearnerProfile {
  /** Opciones por pregunta (la buena incluida). */
  options: number;
  /** Preguntas nuevas en el reto de cada día. */
  newPerDay: number;
  /** Repasos como máximo en el reto (los más urgentes primero). */
  maxReviews: number;
  /** Preguntas del quiz de un tema (o todas si hay menos). */
  quizLength: number;
  /** Botón de pista: quita una opción incorrecta. */
  hints: boolean;
}

export const MIN_AGE = 6;
export const MAX_AGE = 15;
export const DEFAULT_AGE = 10;

/** Preguntas del examen final (como en clase). */
export const EXAM_LENGTH = 20;

export function profileForAge(age: number | null | undefined): LearnerProfile {
  const years = age ?? DEFAULT_AGE;
  if (years <= 8) return { options: 3, newPerDay: 5, maxReviews: 10, quizLength: 8, hints: true };
  if (years <= 10) return { options: 4, newPerDay: 6, maxReviews: 12, quizLength: 10, hints: true };
  if (years <= 12) return { options: 4, newPerDay: 8, maxReviews: 15, quizLength: 10, hints: false };
  return { options: 4, newPerDay: 10, maxReviews: 20, quizLength: 10, hints: false };
}
