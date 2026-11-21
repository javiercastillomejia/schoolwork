import type { UnitContent } from '../../../core/types';
import { GLOSSARY } from './glossary';
import { QUESTIONS } from './questions';
import { STUDY, TOPICS } from './study';

export { GLOSSARY, QUESTIONS, STUDY, TOPICS };

export const unit2: UnitContent = {
  id: 'unit-2',
  label: 'Unit 2',
  title: 'Animals and human beings',
  subtitle: 'Los animales y el ser humano',
  book: 'Natural Science 4 (Anaya) · 4º de Primaria',
  lang: 'en-GB',
  topics: TOPICS,
  study: STUDY,
  questions: QUESTIONS,
  glossary: GLOSSARY,
};
