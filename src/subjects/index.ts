import { english } from './english';
import { matematicas } from './matematicas';
import { naturalScience } from './natural-science';
import type { Store } from '../storage/store';
import { isCustom, type Subject } from './types';

/**
 * Asignaturas de la app, en el orden en que salen en el inicio.
 * Para añadir una asignatura o una unidad, mira el README.
 */
export const SUBJECTS: Subject[] = [naturalScience, matematicas, english];

export function findSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function findUnit(subjectId: string, unitId: string) {
  const subject = findSubject(subjectId);
  const unit = subject?.units.find((u) => u.id === unitId);
  return subject && unit ? { subject, unit } : undefined;
}

/** Días estudiados en cualquier asignatura (también en las unidades con app propia): la racha es común. */
export function allStudyDays(store: Store): number[] {
  const custom = SUBJECTS.flatMap((s) => s.units.filter(isCustom).flatMap((u) => u.summary(store.settings.age).studyDays));
  return [...new Set([...store.studyDays, ...custom])];
}
