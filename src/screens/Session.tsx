import { useState } from 'react';
import { Confetti } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { QuestionCard } from '../components/QuestionCard';
import { SessionBar } from '../components/SessionBar';
import { Stars } from '../components/Stars';
import { profileForAge } from '../core/profile';
import { correctOption, percentOf, starsFor } from '../core/quiz';
import { scheduleRetry, SESSION_LIMITS, stepsFor, type SessionRequest, type Step } from '../core/session';
import { applyAnswer, applyFreeAnswer, cardOf, dayNumber } from '../core/srs';
import { currentStreak } from '../core/stats';
import type { Question } from '../core/types';
import { plural } from '../lib/text';
import { markStudied } from '../storage/store';
import type { UnitScreenProps } from './types';

interface Result {
  questionId: string;
  correct: boolean;
  retry: boolean;
}

/** Una sesión de preguntas: reto del día, quiz de un tema o repaso de fallos. */
export function Session(props: UnitScreenProps & { request: SessionRequest }) {
  const { unit, subject, progress, settings, request, update, updateUnit, back } = props;
  const [today] = useState(dayNumber);
  const [profile] = useState(() => profileForAge(settings.age));
  const [steps, setSteps] = useState<Step[]>(() => stepsFor(request, unit, progress.cards, today, profile, progress.read));
  const [index, setIndex] = useState(0);
  const [retries, setRetries] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Result[]>([]);
  const [finished, setFinished] = useState(false);

  const step = steps[index];
  const question = step ? unit.questions.find((q) => q.id === step.questionId) : undefined;

  /** Guarda la respuesta y devuelve si la pregunta se repetirá en esta sesión. */
  function handleAnswer(current: Step, correct: boolean, usedHint: boolean): boolean {
    const earns = correct && !current.retry && !usedHint;
    const apply = current.free ? applyFreeAnswer : applyAnswer;
    updateUnit((u) => ({
      ...u,
      cards: { ...u.cards, [current.questionId]: apply(cardOf(u.cards, current.questionId), correct, today) },
      rewards: u.rewards + (earns ? 1 : 0),
    }));
    update((s) => markStudied(s, today));
    setResults((r) => [...r, { questionId: current.questionId, correct, retry: Boolean(current.retry) }]);
    if (correct) return false;
    const done = retries[current.questionId] ?? 0;
    setRetries((r) => ({ ...r, [current.questionId]: done + 1 }));
    setSteps((s) => scheduleRetry(s, index, current, done));
    return done < SESSION_LIMITS.maxRetries;
  }

  function next() {
    if (index + 1 >= steps.length) {
      // Fin del quiz de un tema: se guarda la mejor nota (solo cuentan las primeras respuestas).
      if (request.kind === 'topic') {
        const first = results.filter((r) => !r.retry);
        const percent = percentOf(first.filter((r) => r.correct).length, first.length);
        updateUnit((u) => ({ ...u, best: { ...u.best, [request.topicId]: Math.max(u.best[request.topicId] ?? 0, percent) } }));
      }
      setFinished(true);
    }
    setIndex((i) => i + 1);
  }

  if (!step || !question || finished) {
    return <Summary {...props} results={results} today={today} />;
  }

  return (
    <main className="screen session">
      <SessionBar index={index} total={steps.length} onExit={back} />
      <QuestionCard
        key={index}
        question={question}
        topic={unit.topics.find((t) => t.id === question.topic)}
        optionCount={profile.options}
        hints={profile.hints}
        name={settings.name}
        mascot={subject.mascot}
        lang={unit.lang}
        autoSpeak={settings.autoSpeak}
        retry={Boolean(step.retry)}
        onAnswer={(correct, usedHint) => handleAnswer(step, correct, usedHint)}
        onContinue={next}
      />
    </main>
  );
}

const TITLES = ['¡Buen intento, {n}!', '¡Buen trabajo, {n}!', '¡Muy bien, {n}!', '¡Genial, {n}!'];

function Summary({
  unit,
  subject,
  progress,
  settings,
  studyDays,
  request,
  results,
  today,
  go,
  back,
  at,
}: UnitScreenProps & { request: SessionRequest; results: Result[]; today: number }) {
  const { name } = settings;
  const { mascot } = subject;
  const first = results.filter((r) => !r.retry);
  const right = first.filter((r) => r.correct).length;
  const earned = right;
  const percent = percentOf(right, first.length);
  const stars = starsFor(percent);
  const missedIds = [...new Set(results.filter((r) => !r.correct).map((r) => r.questionId))];
  const missed = missedIds.map((id) => unit.questions.find((q) => q.id === id)).filter((q): q is Question => q !== undefined);
  const streak = currentStreak(studyDays, today);
  const keepGoing = request.kind === 'daily' || request.kind === 'more';
  const topicId = request.kind === 'topic' ? request.topicId : undefined;
  const topic = unit.topics.find((t) => t.id === topicId);

  if (results.length === 0) {
    const nothingToReview = request.kind === 'mistakes';
    return (
      <main className="screen summary">
        <Mascot mascot={mascot} mood="happy" size={180} />
        <h1 className="title">{nothingToReview ? `¡No tienes fallos, ${name}!` : `¡Todo al día, ${name}!`}</h1>
        <p className="muted">{nothingToReview ? 'Cuando falles alguna, la repasaremos aquí.' : 'Vuelve mañana para repasar.'}</p>
        <button type="button" className="btn btn-primary btn-block btn-big btn-bottom" onClick={back}>
          Volver
        </button>
      </main>
    );
  }

  const practiceMissed = () => go({ name: 'session', ...at, request: { kind: 'mistakes', questionIds: missedIds } }, { replace: true });

  return (
    <main className="screen summary">
      {stars > 0 && <Confetti />}
      <Mascot mascot={mascot} mood={stars >= 2 ? 'party' : stars === 1 ? 'happy' : 'normal'} size={190} />
      <h1 className="title title-big">{TITLES[stars]?.replace('{n}', name)}</h1>
      <p className="summary-score">
        {right} de {first.length} a la primera · {percent} %
      </p>
      <Stars count={stars} size={52} />
      {topic && (
        <p className="muted small">
          <span lang="en">{topic.title}</span> · tu mejor nota: {Math.max(progress.best[topic.id] ?? 0, percent)} %
        </p>
      )}

      <div className="summary-tiles">
        <span className="summary-tile tint-b">
          <Icon name="leaf" size={24} color="var(--leaf)" />
          <strong>+{earned}</strong>
          {earned === 1 ? mascot.reward.one : mascot.reward.many}
        </span>
        <span className="summary-tile tint-flame">
          <Icon name="flame" size={24} color="var(--flame)" />
          <strong>{streak}</strong>
          {streak === 1 ? 'día seguido' : 'días seguidos'}
        </span>
        <span className="summary-tile tint-a">
          <Icon name="leaf" size={24} color="var(--leaf)" />
          <strong>{progress.rewards}</strong>
          en total
        </span>
      </div>

      {missed.length > 0 && (
        <section className="card missed" aria-labelledby="missed-title">
          <h2 id="missed-title" className="section-title">
            {keepGoing ? 'Mañana repasamos' : 'Para repasar'}
          </h2>
          <ul lang={unit.lang}>
            {missed.map((q) => (
              <li key={q.id}>
                <span className="missed-q">{q.text}</span>
                <strong className="missed-a">{correctOption(q)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="summary-actions">
        {keepGoing ? (
          <button
            type="button"
            className="btn btn-primary btn-block btn-big"
            onClick={() => go({ name: 'session', ...at, request: { kind: 'more' } }, { replace: true })}
            autoFocus
          >
            ¡Quiero más! <Icon name="arrowRight" size={22} strokeWidth={3} />
          </button>
        ) : (
          missed.length > 0 && (
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={practiceMissed} autoFocus>
              Practicar mis fallos ({missed.length}) <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
          )
        )}
        {topic && (
          <button type="button" className="btn btn-secondary btn-block" onClick={() => go({ name: 'session', ...at, request }, { replace: true })}>
            <Icon name="retry" size={20} strokeWidth={2.6} /> Repetir el quiz
          </button>
        )}
        <button type="button" className="btn btn-secondary btn-block" onClick={back}>
          {topic ? 'Volver al tema' : 'Volver'}
        </button>
      </div>
      {missed.length > 0 && !keepGoing && (
        <p className="fine-print">{plural(missed.length, 'pregunta fallada vuelve', 'preguntas falladas vuelven')} al reto de hoy.</p>
      )}
    </main>
  );
}
