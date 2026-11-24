import type { Subject } from '../types';
import { irregularVerbs } from './irregular-verbs';

export const english: Subject = {
  id: 'english',
  name: 'English',
  nameEs: 'Inglés',
  theme: 'violet',
  mascot: {
    art: 'chameleon',
    name: 'Baco',
    species: 'el camaleón',
    reward: { one: 'estrella', many: 'estrellas', emoji: '⭐' },
    intro: 'Cambio de color igual que los verbos irregulares cambian de forma. ¡Por cada acierto a la primera ganas una estrella!',
  },
  units: [irregularVerbs],
};
