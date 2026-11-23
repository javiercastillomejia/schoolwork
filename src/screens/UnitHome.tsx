import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { MascotSays } from '../components/Mascot';
import { Stars } from '../components/Stars';
import { profileForAge } from '../core/profile';
import { formatGrade, PASS_PERCENT, starsFor } from '../core/quiz';
import { hardest, planDaily, planMore, type SessionPlan } from '../core/session';
import { dayNumber } from '../core/srs';
import { currentStreak, topicProgress, unitSummary } from '../core/stats';
import { plural } from '../lib/text';
import type { UnitScreenProps } from './types';

function minutesFor(plan: SessionPlan): number {
  return Math.max(1, Math.round(((plan.reviewCount + plan.newCount + plan.practiceCount) * 25) / 60));
}

export function UnitHome({ subject, unit, progress, settings, studyDays, go, back, at }: UnitScreenProps) {
  const today = dayNumber();
  const profile = useMemo(() => profileForAge(settings.age), [settings.age]);
  const { cards, best, read } = progress;
  const daily = useMemo(() => planDaily(unit, cards, today, profile, read), [unit, cards, today, profile, read]);
  const more = useMemo(() => planMore(unit, cards, today, profile, read), [unit, cards, today, profile, read]);
  const summary = unitSummary(unit, cards, best);
  const streak = currentStreak(studyDays, today);
  const mistakes = hardest(unit, cards).length;
  const lastExam = progress.exams[progress.exams.length - 1];
  const bestExam = progress.exams.reduce<number | undefined>((m, e) => (m === undefined || e.percent > m ? e.percent : m), undefined);
  const { mascot } = subject;

  const reviews = daily.reviewCount;
  const fresh = daily.newCount;
  const dailyDone = reviews + fresh === 0;
  const topicName = (id: string | undefined) => unit.topics.find((t) => t.id === id)?.title ?? '';

  let message: string;
  if (summary.seen === 0 && reviews + fresh > 0) {
    message = `¡Hola, ${settings.name}! Soy ${mascot.name}. Empezamos con «${topicName(daily.newTopics[0])}». Puedes leer el tema antes o lanzarte al reto.`;
  } else if (reviews > 0 && fresh > 0) {
    message = `Hoy toca repasar ${plural(reviews, 'pregunta', 'preguntas')} y responder ${plural(fresh, 'nueva', 'nuevas')}. ¿Empezamos?`;
  } else if (reviews > 0) {
    message = `Hoy toca repasar ${plural(reviews, 'pregunta', 'preguntas')}. ¿Empezamos?`;
  } else if (fresh > 0) {
    message = `Hoy te esperan ${plural(fresh, 'pregunta nueva', 'preguntas nuevas')}. ¿Empezamos?`;
  } else {
    message = `¡Reto de hoy cumplido, ${settings.name}! Si te apetece, seguimos todo lo que quieras.`;
  }

  const moreText =
    more.newCount > 0
      ? `Te esperan ${plural(more.newCount, 'pregunta nueva', 'preguntas nuevas')} de «${topicName(more.newTopics[0])}».`
      : 'Ya han salido todas las preguntas. Repasa las que más te cuestan para que no se te olviden.';

  return (
    <main className="screen unit-home">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={back} aria-label="Inicio">
          <Icon name="home" size={22} strokeWidth={2.4} />
        </button>
        <div className="unit-heading">
          <span className="unit-kicker" lang={unit.lang}>
            {subject.name} · {unit.label}
          </span>
          <h1 className="title unit-name" lang={unit.lang}>
            {unit.title}
          </h1>
        </div>
        <button type="button" className="icon-btn" onClick={() => go({ name: 'settings' })} aria-label="Ajustes">
          <Icon name="settings" strokeWidth={2.2} />
        </button>
      </header>

      <div className="pills">
        <span className="pill pill-flame">
          <Icon name="flame" size={20} color="var(--flame)" />
          {streak > 0 ? plural(streak, 'día seguido', 'días seguidos') : 'Empieza tu racha'}
        </span>
        <span className="pill pill-reward">
          <span className="reward-emoji" aria-hidden="true">
            {mascot.reward.emoji}
          </span>
          {plural(progress.rewards, mascot.reward.one, mascot.reward.many)}
        </span>
      </div>

      <MascotSays mascot={mascot} mood={dailyDone ? 'happy' : 'normal'}>
        {message}
      </MascotSays>

      <section className="card mission" aria-labelledby="mission-title">
        <h2 id="mission-title" className="section-title">
          {dailyDone ? '¡Reto cumplido!' : 'Reto de hoy'}
        </h2>
        {dailyDone ? (
          <>
            <div className="more-callout">
              <Icon name="sparkle" size={22} color="var(--star)" />
              <p>
                <strong>¿Quieres más?</strong> {moreText}
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={() => go({ name: 'session', ...at, request: { kind: 'more' } })}>
              ¡Quiero más! <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
          </>
        ) : (
          <>
            <div className="mission-tiles">
              <span className="mission-tile tint-a">
                <strong>{reviews}</strong> {reviews === 1 ? 'repaso' : 'repasos'}
              </span>
              <span className="mission-tile tint-b">
                <strong>{fresh}</strong> {fresh === 1 ? 'nueva' : 'nuevas'}
              </span>
              <span className="mission-tile tint-c">
                <strong>{minutesFor(daily)}</strong> {minutesFor(daily) === 1 ? 'minuto' : 'minutos'}
              </span>
            </div>
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={() => go({ name: 'session', ...at, request: { kind: 'daily' } })}>
              ¡Empezar! <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
            <p className="muted small mission-foot">Cuando lo termines, podrás seguir todo lo que quieras.</p>
          </>
        )}
      </section>

      <section aria-labelledby="practice-title">
        <h2 id="practice-title" className="section-title practice-title">
          Practica a tu manera
        </h2>
        <nav className="practice-tiles" aria-labelledby="practice-title">
          <button type="button" className="practice-tile tint-b" onClick={() => go({ name: 'cards', ...at })}>
            <span className="practice-icon practice-icon-cards">
              <Icon name="cards" size={26} strokeWidth={2.4} />
            </span>
            <span className="practice-name">Fichas</span>
            <span className="practice-note">{unit.glossary.length} palabras</span>
          </button>
          <button
            type="button"
            className="practice-tile tint-a"
            onClick={() => go({ name: 'session', ...at, request: { kind: 'mistakes' } })}
            disabled={mistakes === 0}
          >
            <span className="practice-icon practice-icon-mistakes">
              <Icon name="target" size={26} strokeWidth={2.4} />
            </span>
            <span className="practice-name">Mis fallos</span>
            <span className="practice-note">{mistakes === 0 ? 'ninguno aún' : plural(mistakes, 'pregunta', 'preguntas')}</span>
          </button>
          <button type="button" className="practice-tile tint-c" onClick={() => go({ name: 'exam', ...at })}>
            <span className="practice-icon practice-icon-exam">
              <Icon name="exam" size={26} strokeWidth={2.4} />
            </span>
            <span className="practice-name">Examen</span>
            <span className="practice-note">{lastExam ? `última: ${formatGrade(lastExam.grade)}` : '20 preguntas'}</span>
          </button>
        </nav>
      </section>

      <section aria-labelledby="path-title">
        <div className="path-head">
          <h2 id="path-title" className="section-title">
            Tu camino
          </h2>
          <span className="muted small">
            {summary.topicsDone} de {unit.topics.length} temas
          </span>
        </div>
        <ol className="topic-path">
          {unit.topics.map((topic, i) => {
            const tp = topicProgress(unit, cards, topic.id, best[topic.id], read.includes(topic.id));
            return (
              <li key={topic.id} className={`topic-step is-${tp.state}`}>
                <button type="button" className="topic-card" onClick={() => go({ name: 'topic', ...at, topic: topic.id })}>
                  <span className="topic-emoji" aria-hidden="true">
                    {topic.emoji}
                  </span>
                  <span className="topic-text">
                    <span className="topic-number">Tema {i + 1}</span>
                    <span className="topic-title" lang={unit.lang}>
                      {topic.title}
                    </span>
                    <span className="topic-subtitle">{topic.subtitle}</span>
                  </span>
                  <span className="topic-score">
                    <Stars count={tp.stars} />
                    <span className="topic-best">
                      {tp.best === undefined ? (tp.state === 'started' ? 'empezado' : 'sin hacer') : `${tp.best} %`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          <li className={`topic-step is-goal ${(bestExam ?? 0) >= PASS_PERCENT ? 'is-done' : ''}`}>
            <button type="button" className="topic-card topic-card-goal" onClick={() => go({ name: 'exam', ...at })}>
              <span className="topic-emoji" aria-hidden="true">
                🏆
              </span>
              <span className="topic-text">
                <span className="topic-number">Meta</span>
                <span className="topic-title">Examen final</span>
                <span className="topic-subtitle">20 preguntas de toda la unidad</span>
              </span>
              <span className="topic-score">
                <Stars count={starsFor(bestExam)} />
                <span className="topic-best">{bestExam === undefined ? 'sin hacer' : `${bestExam} %`}</span>
              </span>
            </button>
          </li>
        </ol>
      </section>

      <p className="fine-print">{unit.book}</p>
    </main>
  );
}
