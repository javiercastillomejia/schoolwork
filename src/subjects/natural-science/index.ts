import type { Subject } from '../types';
import { unit2 } from './unit-2';

export const naturalScience: Subject = {
  id: 'natural-science',
  name: 'Natural Science',
  nameEs: 'Ciencias de la Naturaleza',
  theme: 'nature',
  mascot: {
    art: 'koala',
    name: 'Koa',
    species: 'el koala',
    reward: { one: 'hoja', many: 'hojas', emoji: '🍃' },
    intro: 'Te voy a acompañar mientras estudias Natural Science. ¡Por cada acierto a la primera me das una hoja de eucalipto! 🍃',
  },
  units: [unit2],
};
