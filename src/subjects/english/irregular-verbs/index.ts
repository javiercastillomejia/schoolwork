import { lazy } from 'react';
import type { CustomUnit } from '../../types';
import { VERBS } from './app/data/verbs';
import { profileForAge } from './app/engine/profile';
import { planDaily } from './app/engine/session';
import { dayNumber } from './app/engine/srs';
import { emptyProgress, loadProgress, saveProgress } from './app/storage/progress';

/**
 * Los verbos irregulares: la app que se hizo primero, aparte, ahora dentro de
 * Schoolwork. Tiene su propio motor (semanas, presentar, elegir y escribir,
 * Mis verbos, repaso y examen en tabla) y guarda su progreso aparte.
 */
export const irregularVerbs: CustomUnit = {
  kind: 'custom',
  id: 'irregular-verbs',
  label: 'Irregular verbs',
  title: 'Irregular verbs',
  subtitle: `Los ${VERBS.length} verbos de la hoja de clase: infinitivo, pasado y significado`,
  book: 'Hoja de verbos irregulares de clase (11 semanas)',
  lang: 'en-GB',
  App: lazy(() => import('./app/App')),
  summary(age) {
    const progress = loadProgress();
    const today = dayNumber();
    const learned = VERBS.filter((verb) => (progress.cards[verb.id]?.box ?? 0) >= 2).length;
    const plan = progress.settings.onboarded ? planDaily(progress.cards, progress.settings.currentWeek, today, profileForAge(age)) : null;
    return {
      percent: Math.round((learned / VERBS.length) * 100),
      pending: plan ? plan.reviewCount + plan.newCount : null,
      pendingWord: ['verbo', 'verbos'],
      detail: `${learned} de ${VERBS.length} verbos`,
      studyDays: progress.studyDays,
    };
  },
  reset() {
    const progress = loadProgress();
    saveProgress({ ...emptyProgress(), settings: { ...progress.settings } });
  },
};
