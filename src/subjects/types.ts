import type { UnitContent } from '../core/types';
import type { MascotInfo } from '../mascots/types';

export interface Subject {
  /** Identificador en la URL, p. ej. `natural-science`. */
  id: string;
  /** Nombre como en el horario del cole. */
  name: string;
  nameEs: string;
  /** Tema de colores (clase `theme-<theme>` en styles.css). */
  theme: string;
  mascot: MascotInfo;
  units: UnitContent[];
}
