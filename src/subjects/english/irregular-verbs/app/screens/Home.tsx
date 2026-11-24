import { useMemo } from 'react';
import { VERBS, WEEKS } from '../data/verbs';
import { profileForAge } from '../engine/profile';
import { planDaily, planMore, type SessionMode, type SessionPlan } from '../engine/session';
import { dayNumber } from '../engine/srs';
import { currentStreak, weekProgress } from '../engine/stats';
import type { Progress } from '../storage/progress';
import { BacoSays } from '../components/Baco';
import { Icon } from '../components/Icon';
import { WeekPath } from '../components/WeekPath';

export type PracticeScreen = 'verbs' | 'review' | 'exam';

interface Props {
  progress: Progress;
  onStart: (mode: SessionMode) => void;
  onSettings: () => void;
  onPractice: (screen: PracticeScreen) => void;
  /** Volver al inicio de Schoolwork. */
  onExit: () => void;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "la semana 2" o "las semanas 2 y 3". */
function weeksLabel(weeks: number[]): string {
  if (weeks.length === 1) return `la semana ${weeks[0]}`;
  return `las semanas ${weeks.slice(0, -1).join(', ')} y ${weeks[weeks.length - 1]}`;
}

function minutesFor(plan: SessionPlan): number {
  return Math.max(1, Math.round(((plan.reviewCount + plan.practiceCount + plan.newCount * 2) * 15) / 60));
}

export function Home({ progress, onStart, onSettings, onPractice, onExit }: Props) {
  const { cards, settings } = progress;
  const today = dayNumber();
  const daily = useMemo(
    () => planDaily(cards, settings.currentWeek, today, profileForAge(settings.age)),
    [cards, settings.currentWeek, settings.age, today],
  );
  const more = useMemo(
    () => planMore(cards, settings.currentWeek, today, profileForAge(settings.age)),
    [cards, settings.currentWeek, settings.age, today],
  );
  const streak = currentStreak(progress.studyDays, today);
  const weeksDone = WEEKS.filter((week) => weekProgress(cards, week).stars > 0).length;

  const { reviewCount: reviews, newCount: fresh } = daily;
  const dailyDone = reviews + fresh === 0;
  const seenCount = VERBS.filter((verb) => (cards[verb.id]?.box ?? 0) > 0).length;
  const allSeen = seenCount === VERBS.length;

  let message: string;
  if (reviews > 0 && fresh > 0) {
    message = `Hoy toca repasar ${plural(reviews, 'verbo', 'verbos')} y conocer ${plural(fresh, 'nuevo', 'nuevos')}. ¿Empezamos?`;
  } else if (reviews > 0) {
    message = `Hoy toca repasar ${plural(reviews, 'verbo', 'verbos')}. ¿Empezamos?`;
  } else if (fresh > 0) {
    message = `Hoy vas a conocer ${plural(fresh, 'verbo nuevo', 'verbos nuevos')}. ¿Empezamos?`;
  } else {
    message = `¡Reto de hoy cumplido, ${settings.name}! Si te apetece, seguimos aprendiendo todo lo que quieras.`;
  }

  let moreText: string;
  if (more.newCount > 0) {
    moreText = `Te esperan ${plural(more.newCount, 'verbo nuevo', 'verbos nuevos')} de ${weeksLabel(more.newWeeks)}.`;
  } else if (allSeen) {
    moreText = `Ya conoces los ${VERBS.length} verbos. Repasa los que más te cuestan para que no se te olviden.`;
  } else {
    moreText = 'Repasa los que más te cuestan.';
  }

  return (
    <main className="screen home">
      <header className="home-head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Inicio">
          <Icon name="home" strokeWidth={2.4} />
        </button>
        <h1 className="title">¡Hola, {settings.name}!</h1>
        <button type="button" className="icon-btn" onClick={onSettings} aria-label="Ajustes">
          <Icon name="settings" strokeWidth={2.2} />
        </button>
      </header>

      <div className="pills">
        <span className="pill pill-flame">
          <Icon name="flame" size={20} color="var(--flame)" />
          {streak > 0 ? plural(streak, 'día seguido', 'días seguidos') : 'Empieza tu racha'}
        </span>
        <span className="pill pill-star">
          <Icon name="star" size={20} color="var(--star)" />
          {plural(progress.stars, 'estrella', 'estrellas')}
        </span>
      </div>

      <BacoSays mood={dailyDone ? 'happy' : 'normal'}>{message}</BacoSays>

      <section className="card mission" aria-labelledby="mission-title">
        <div className="mission-head">
          <h2 id="mission-title" className="section-title">
            {dailyDone ? '¡Reto cumplido!' : 'Reto de hoy'}
          </h2>
          <button type="button" className="chip" onClick={onSettings}>
            Semana {settings.currentWeek}
          </button>
        </div>
        {dailyDone ? (
          <>
            <div className="more-callout">
              <Icon name="sparkle" size={22} color="var(--star)" />
              <p>
                <strong>¿Quieres más?</strong> {moreText}
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={() => onStart('more')}>
              ¡Quiero más! <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
          </>
        ) : (
          <>
            <div className="mission-tiles">
              <span className="mission-tile tint-5">
                <strong>{reviews}</strong> {reviews === 1 ? 'repaso' : 'repasos'}
              </span>
              <span className="mission-tile tint-3">
                <strong>{fresh}</strong> {fresh === 1 ? 'nuevo' : 'nuevos'}
              </span>
              <span className="mission-tile tint-4">
                <strong>{minutesFor(daily)}</strong> {minutesFor(daily) === 1 ? 'minuto' : 'minutos'}
              </span>
            </div>
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={() => onStart('daily')}>
              ¡Empezar! <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
            <p className="muted small mission-foot">Cuando lo termines, podrás seguir aprendiendo todo lo que quieras.</p>
          </>
        )}
      </section>

      <section aria-labelledby="practice-title">
        <h2 id="practice-title" className="section-title practice-title">
          Practica a tu manera
        </h2>
        <nav className="practice-tiles" aria-labelledby="practice-title">
          <button type="button" className="practice-tile tint-5" onClick={() => onPractice('verbs')}>
            <span className="practice-icon practice-icon-verbs">
              <Icon name="book" size={26} strokeWidth={2.4} />
            </span>
            <span className="practice-name">Mis verbos</span>
            <span className="practice-note">{seenCount} vistos</span>
          </button>
          <button type="button" className="practice-tile tint-3" onClick={() => onPractice('review')}>
            <span className="practice-icon practice-icon-review">
              <Icon name="cards" size={26} strokeWidth={2.4} />
            </span>
            <span className="practice-name">Repasar</span>
            <span className="practice-note">a tu aire</span>
          </button>
          <button type="button" className="practice-tile tint-4" onClick={() => onPractice('exam')}>
            <span className="practice-icon practice-icon-exam">
              <Icon name="exam" size={26} strokeWidth={2.4} />
            </span>
            <span className="practice-name">Examen</span>
            <span className="practice-note">como en clase</span>
          </button>
        </nav>
      </section>

      <section aria-labelledby="path-title">
        <div className="path-head">
          <h2 id="path-title" className="section-title">
            Tu camino
          </h2>
          <span className="muted small">
            {weeksDone} de {WEEKS.length} semanas
          </span>
        </div>
        <WeekPath cards={cards} currentWeek={settings.currentWeek} />
      </section>
    </main>
  );
}
