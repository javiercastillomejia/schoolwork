import type { Subject } from '../types';
import { unidad3 } from './unidad-3';

export const matematicas: Subject = {
  id: 'matematicas',
  name: 'Matemáticas',
  nameEs: '4.º de Primaria',
  theme: 'ocean',
  mascot: {
    art: 'seal',
    name: 'Lola',
    species: 'la foca',
    reward: { one: 'pez', many: 'peces', emoji: '🐟' },
    intro: 'Te voy a enseñar matemáticas. ¡Por cada acierto a la primera me das un pez! 🐟',
  },
  units: [unidad3],
};
