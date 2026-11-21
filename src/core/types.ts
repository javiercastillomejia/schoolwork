/**
 * Forma del contenido de una unidad. Cualquier unidad de cualquier asignatura
 * que tenga temas, fichas de estudio, preguntas de elegir y glosario usa el
 * mismo motor y las mismas pantallas: basta con rellenar estos datos.
 */

/** Texto con **negritas** para las palabras clave. */
export type RichText = string;

export interface Topic {
  /** Identificador corto y estable (se usa en el progreso guardado). */
  id: string;
  emoji: string;
  /** Título en el idioma del libro. */
  title: string;
  /** Subtítulo en español. */
  subtitle: string;
}

export type ListItem = RichText | { text: RichText; items: ListItem[] };

export type StudyBlock =
  /** Subtítulo dentro de la ficha. */
  | { type: 'heading'; text: RichText }
  | { type: 'p'; text: RichText }
  | { type: 'list'; items: ListItem[] }
  /** Tabla; en el móvil cada fila se ve como una tarjeta (primera columna = título). */
  | { type: 'table'; head: string[]; rows: RichText[][] }
  /** Parejas cortas: "kitten → cat", "sight → eyes". */
  | { type: 'pairs'; title?: RichText; items: [string, string][] }
  /** Recuadro destacado para recordar. */
  | { type: 'tip'; text: RichText }
  /** Nota para padres, en español (no se lee en voz alta). */
  | { type: 'note'; text: string }
  /** Viñetas de un cómic: quién habla y qué dice. */
  | { type: 'dialogue'; lines: { who: string; text: RichText }[] }
  /** Mapa conceptual en árbol. */
  | { type: 'tree'; root: ListItem }
  /** Pasos en orden (p. ej., respiración en caja). */
  | { type: 'steps'; title?: RichText; items: RichText[] };

export interface Question {
  /** `<tema>-<nº>`: estable aunque se añadan preguntas al final. */
  id: string;
  topic: string;
  text: string;
  /** La primera es la correcta; la app las baraja. */
  options: [string, ...string[]];
  /** Se enseña después de contestar. */
  why: string;
}

export interface GlossaryTerm {
  word: string;
  /** Traducción al español. */
  translation: string;
  definition: string;
}

export interface UnitContent {
  /** Identificador en la URL, p. ej. `unit-2`. */
  id: string;
  /** "Unit 2". */
  label: string;
  title: string;
  subtitle: string;
  /** Libro y curso, para los padres. */
  book: string;
  /** Idioma del contenido (lectura en voz alta). */
  lang: 'en-GB' | 'es-ES';
  topics: Topic[];
  study: Record<string, StudyBlock[]>;
  questions: Question[];
  glossary: GlossaryTerm[];
}
