import type { UnitContent } from '../core/types';
import type { Route } from '../lib/router';
import type { Settings, Store, UnitProgress } from '../storage/store';
import type { Subject } from '../subjects/types';

/** Lo que recibe cada pantalla de una unidad. */
export interface UnitScreenProps {
  subject: Subject;
  unit: UnitContent;
  progress: UnitProgress;
  settings: Settings;
  studyDays: number[];
  /** Cambia el progreso de esta unidad. */
  updateUnit: (change: (unit: UnitProgress) => UnitProgress) => void;
  /** Cambia cualquier cosa del guardado (p. ej., marcar el día como estudiado). */
  update: (change: (store: Store) => Store) => void;
  go: (route: Route, options?: { replace?: boolean }) => void;
  back: () => void;
  /** Asignatura y unidad, para construir rutas. */
  at: { subject: string; unit: string };
}
