import { naturalScience } from './natural-science';
import type { Subject } from './types';

/**
 * Asignaturas de la app, en el orden en que salen en el inicio.
 * Para añadir una asignatura o una unidad, mira el README.
 */
export const SUBJECTS: Subject[] = [naturalScience];

export function findSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function findUnit(subjectId: string, unitId: string) {
  const subject = findSubject(subjectId);
  const unit = subject?.units.find((u) => u.id === unitId);
  return subject && unit ? { subject, unit } : undefined;
}
