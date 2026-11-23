export type MascotMood = 'normal' | 'happy' | 'oops' | 'party';

export interface MascotInfo {
  /** Dibujo (ver components/Mascot.tsx). */
  art: 'koala' | 'seal';
  /** Nombre con el que se presenta ("Koa"). */
  name: string;
  /** "el koala". */
  species: string;
  /** Qué gana con cada acierto a la primera ("hoja", "hojas"). */
  reward: { one: string; many: string; emoji: string };
  /** Cómo se presenta la primera vez. */
  intro: string;
}
