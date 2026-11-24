import type { ComponentType, LazyExoticComponent } from 'react';
import type { UnitContent } from '../core/types';
import type { MascotInfo } from '../mascots/types';

/** Lo que recibe la app propia de una unidad. */
export interface CustomUnitProps {
  name: string;
  age: number | null;
  /** Volver al inicio de Schoolwork. */
  onExit: () => void;
}

/**
 * Unidad con su propia app (p. ej., los verbos irregulares, que se hicieron
 * antes y aparte). Se abre a pantalla completa y guarda su progreso aparte.
 */
export interface CustomUnit {
  kind: 'custom';
  id: string;
  label: string;
  title: string;
  subtitle: string;
  book: string;
  lang: 'en-GB' | 'es-ES';
  App: ComponentType<CustomUnitProps> | LazyExoticComponent<ComponentType<CustomUnitProps>>;
  /** Resumen para el inicio, leído de su propio guardado. */
  summary: (age: number | null) => {
    percent: number;
    /** Lo que queda del reto de hoy; null si aún no ha empezado. */
    pending: number | null;
    /** Cómo se cuenta lo del reto: ['verbo', 'verbos']. */
    pendingWord: [string, string];
    detail: string;
    /** Días estudiados (para la racha común). */
    studyDays: number[];
  };
  /** Borra su progreso. */
  reset: () => void;
}

export type Unit = UnitContent | CustomUnit;

export function isCustom(unit: Unit): unit is CustomUnit {
  return 'kind' in unit && unit.kind === 'custom';
}

export interface Subject {
  /** Identificador en la URL, p. ej. `natural-science`. */
  id: string;
  /** Nombre como en el horario del cole. */
  name: string;
  nameEs: string;
  /** Tema de colores (`:root[data-theme='<theme>']` en styles.css). */
  theme: string;
  mascot: MascotInfo;
  units: Unit[];
}
