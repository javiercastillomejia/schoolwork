import type { UnitContent } from '../../../core/types';
import { GLOSSARY } from './glossary';
import { PRACTICE } from './practice';
import { SHEET } from './sheet';
import { STUDY, TOPICS } from './study';

export { GLOSSARY, PRACTICE, SHEET, STUDY, TOPICS };

export const unidad3: UnitContent = {
  id: 'unidad-3',
  label: 'Unidad 3',
  title: 'Las fracciones',
  subtitle: 'Temario y hoja de repaso del cole',
  book: 'Matemáticas 4.º Primaria (Anaya), Unidad 3, páginas 34-41 · Hoja de repaso del cole',
  lang: 'es-ES',
  topics: TOPICS,
  study: STUDY,
  questions: [...PRACTICE, ...SHEET],
  glossary: GLOSSARY,
};
