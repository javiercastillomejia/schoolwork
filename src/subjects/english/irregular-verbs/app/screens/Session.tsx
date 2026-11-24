import { useState } from 'react';
import { VERBS, getVerb, pastLabel } from '../data/verbs';
import { profileForAge, type LearnerProfile } from '../engine/profile';
import { practiceSteps, type ReviewStyle } from '../engine/review';
import {
  cardOf,
  introductionSteps,
  planFor,
  scheduleRetry,
  SESSION_LIMITS,
  type Cards,
  type Step,
} from '../engine/session';
import { applyAnswer, applyPracticeAnswer, dayNumber, introduce, MAX_BOX } from '../engine/srs';
import { currentStreak, sessionStars } from '../engine/stats';
import type { Progress } from '../storage/progress';
import { Baco } from '../components/Baco';
import { ChoiceQuestion } from '../components/ChoiceQuestion';
import { FlashCard } from '../components/FlashCard';
import { Icon } from '../components/Icon';
import { PresentCard } from '../components/PresentCard';
import { WriteQuestion } from '../components/WriteQuestion';

/**
 * Qué sesión se hace:
 *  - `daily`: el reto de hoy; `more`: seguir aprendiendo después del reto;
 *  - `practice`: repaso a su aire de unos verbos ya estudiados (tarjetas o preguntas);
 *  - `learn`: aprender ya un verbo concreto que todavía no ha visto.
 */
export type SessionRequest =
  | { kind: 'daily' }
  | { kind: 'more' }
  | { kind: 'practice'; verbIds: number[]; style: ReviewStyle }
  | { kind: 'learn'; verbIds: number[] };

function stepsFor(request: SessionRequest, cards: Cards, currentWeek: number, today: number, profile: LearnerProfile): Step[] {
  if (request.kind === 'daily' || request.kind === 'more') {
    return planFor(request.kind, cards, currentWeek, today, profile).steps;
  }
  if (request.kind === 'learn') return introductionSteps(request.verbIds.map(getVerb), profile);
  return practiceSteps(request.verbIds, request.style, cards, profile);
}

interface Props {
  request: SessionRequest;
  progress: Progress;
  update: (change: (progress: Progress) => Progress) => void;
  onExit: () => void;
  /** Empezar otra sesión justo después (seguir aprendiendo o practicar los fallos). */
  onNext: (request: SessionRequest) => void;
}

interface Result {
  verbId: number;
  correct: boolean;
  retry: boolean;
}

export function Session({ request, progress, update, onExit, onNext }: Props) {
  const [today] = useState(dayNumber);
  const [profile] = useState(() => profileForAge(progress.settings.age));
  const [steps, setSteps] = useState<Step[]>(() =>
    stepsFor(request, progress.cards, progress.settings.currentWeek, today, profile),
  );
  const [index, setIndex] = useState(0);
  const [retries, setRetries] = useState<Record<number, number>>({});
  const [results, setResults] = useState<Result[]>([]);

  const step = steps[index];
  const { autoSpeak, name } = progress.settings;
  const isCards = request.kind === 'practice' && request.style === 'cards';

  function handlePresented(verbId: number) {
    update((p) => ({ ...p, cards: { ...p.cards, [verbId]: introduce(cardOf(p.cards, verbId), today) } }));
    setIndex((i) => i + 1);
  }

  /** Guarda la respuesta y devuelve si el verbo se repetirá en esta sesión. */
  function handleAnswer(current: Step, correct: boolean): boolean {
    // Las tarjetas son autoevaluación: no dan estrellas.
    const earnsStar = correct && !current.retry && current.kind !== 'card';
    const answer = current.practice ? applyPracticeAnswer : applyAnswer;
    update((p) => ({
      ...p,
      cards: { ...p.cards, [current.verbId]: answer(cardOf(p.cards, current.verbId), correct, today) },
      studyDays: p.studyDays.includes(today) ? p.studyDays : [...p.studyDays, today],
      stars: p.stars + (earnsStar ? 1 : 0),
    }));
    setResults((r) => [...r, { verbId: current.verbId, correct, retry: Boolean(current.retry) }]);
    if (correct) return false;
    const done = retries[current.verbId] ?? 0;
    setRetries((r) => ({ ...r, [current.verbId]: done + 1 }));
    setSteps((s) => scheduleRetry(s, index, current, done));
    return done < SESSION_LIMITS.maxRetries;
  }

  const next = () => setIndex((i) => i + 1);

  if (!step) {
    return (
      <Summary
        request={request}
        cardsMode={isCards}
        progress={progress}
        today={today}
        results={results}
        onExit={onExit}
        onNext={onNext}
      />
    );
  }

  const verb = getVerb(step.verbId);
  const percent = Math.round((index / steps.length) * 100);

  return (
    <main className="screen session">
      <header className="session-bar">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Salir">
          <Icon name="close" size={20} strokeWidth={3} />
        </button>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={index}
          aria-label="Progreso"
        >
          <span style={{ width: `${Math.max(percent, 4)}%` }} />
        </div>
        <span className="session-count">
          {index + 1}/{steps.length}
        </span>
      </header>

      {step.retry && <p className="retry-note">¡Otra vez este! A por él.</p>}

      {step.kind === 'present' && (
        <PresentCard key={index} verb={verb} autoSpeak={autoSpeak} onDone={() => handlePresented(verb.id)} />
      )}
      {step.kind === 'choice' && (
        <ChoiceQuestion
          key={index}
          verb={verb}
          name={name}
          autoSpeak={autoSpeak}
          retry={Boolean(step.retry)}
          onAnswer={(correct) => handleAnswer(step, correct)}
          onContinue={next}
        />
      )}
      {step.kind === 'write' && (
        <WriteQuestion
          key={index}
          verb={verb}
          name={name}
          autoSpeak={autoSpeak}
          retry={Boolean(step.retry)}
          hint={profile.firstLetterHint}
          onAnswer={(correct) => handleAnswer(step, correct)}
          onContinue={next}
        />
      )}
      {step.kind === 'card' && (
        <FlashCard
          key={index}
          verb={verb}
          autoSpeak={autoSpeak}
          onAnswer={(knew) => handleAnswer(step, knew)}
          onContinue={next}
        />
      )}
    </main>
  );
}

const TITLES = ['', '¡Buen trabajo, {n}!', '¡Muy bien, {n}!', '¡Genial, {n}!'];

function Summary({
  request,
  cardsMode,
  progress,
  today,
  results,
  onExit,
  onNext,
}: {
  request: SessionRequest;
  cardsMode: boolean;
  progress: Progress;
  today: number;
  results: Result[];
  onExit: () => void;
  onNext: (request: SessionRequest) => void;
}) {
  const { name } = progress.settings;
  const firstTries = results.filter((r) => !r.retry);
  const right = firstTries.filter((r) => r.correct).length;
  const stars = sessionStars(right, firstTries.length);
  const missed = [...new Set(results.filter((r) => !r.correct).map((r) => r.verbId))].map(getVerb);
  const streak = currentStreak(progress.studyDays, today);
  const mastered = VERBS.filter((verb) => (progress.cards[verb.id]?.box ?? 0) >= MAX_BOX).length;
  const keepGoing = request.kind === 'daily' || request.kind === 'more';

  if (results.length === 0) {
    return (
      <main className="screen summary">
        <Baco mood="happy" size={180} />
        <h1 className="title">¡Todo al día, {name}!</h1>
        <p className="muted">Vuelve mañana para repasar.</p>
        <button type="button" className="btn btn-primary btn-block btn-big btn-bottom" onClick={onExit}>
          Volver
        </button>
      </main>
    );
  }

  const practiceMissed = () =>
    onNext({ kind: 'practice', verbIds: missed.map((verb) => verb.id), style: cardsMode ? 'cards' : 'questions' });

  return (
    <main className="screen summary">
      <Confetti />
      <Baco mood="party" size={200} />
      <h1 className="title title-big">{TITLES[stars]?.replace('{n}', name)}</h1>
      <p className="summary-score">
        {cardsMode ? `Te sabías ${right} de ${firstTries.length}` : `${right} de ${firstTries.length} a la primera`}
      </p>

      <div className="summary-stars" role="img" aria-label={`${stars} de 3 estrellas`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="summary-star">
            <Icon name="star" size={i === 1 ? 62 : 48} color={i < stars ? 'var(--star)' : 'var(--star-empty)'} />
          </span>
        ))}
      </div>

      <div className="summary-tiles">
        {cardsMode ? (
          <span className="summary-tile tint-5">
            <Icon name="sparkle" size={24} color="var(--primary)" />
            <strong>{right}</strong>
            {right === 1 ? 'sabido' : 'sabidos'}
          </span>
        ) : (
          <span className="summary-tile tint-4">
            <Icon name="star" size={24} color="var(--star)" />
            <strong>+{right}</strong>
            {right === 1 ? 'estrella' : 'estrellas'}
          </span>
        )}
        <span className="summary-tile tint-flame">
          <Icon name="flame" size={24} color="var(--flame)" />
          <strong>{streak}</strong>
          {streak === 1 ? 'día seguido' : 'días seguidos'}
        </span>
        <span className="summary-tile tint-3">
          <Icon name="check" size={24} color="var(--ok)" />
          <strong>{mastered}</strong>
          {mastered === 1 ? 'dominado' : 'dominados'}
        </span>
      </div>

      {missed.length > 0 && (
        <section className="card missed" aria-labelledby="missed-title">
          <h2 id="missed-title" className="section-title">
            {keepGoing ? 'Mañana repasamos' : 'Para repasar'}
          </h2>
          <ul>
            {missed.map((verb) => (
              <li key={verb.id}>
                <span lang="en">
                  to {verb.base} → <strong>{pastLabel(verb)}</strong>
                </span>
                <span className="muted small">{verb.meaning.replace(/\//g, ' / ')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="summary-actions">
        {keepGoing ? (
          <button type="button" className="btn btn-primary btn-block btn-big" onClick={() => onNext({ kind: 'more' })} autoFocus>
            ¡Quiero más! <Icon name="arrowRight" size={22} strokeWidth={3} />
          </button>
        ) : (
          missed.length > 0 && (
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={practiceMissed} autoFocus>
              Practicar mis fallos ({missed.length}) <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
          )
        )}
        <button type="button" className="btn btn-secondary btn-block" onClick={onExit}>
          Volver
        </button>
      </div>
    </main>
  );
}

function Confetti() {
  return (
    <svg className="confetti" viewBox="0 0 390 360" aria-hidden="true">
      <rect x="36" y="64" width="12" height="20" rx="3" fill="#FF8FB1" transform="rotate(-25 42 74)" />
      <rect x="330" y="52" width="12" height="20" rx="3" fill="#5CC8FF" transform="rotate(30 336 62)" />
      <circle cx="82" cy="150" r="6" fill="#FFC531" />
      <circle cx="316" cy="170" r="7" fill="#6C4CF5" />
      <rect x="290" y="250" width="10" height="16" rx="3" fill="#3CC47C" transform="rotate(-20 295 258)" />
      <rect x="52" y="270" width="10" height="16" rx="3" fill="#F08A24" transform="rotate(35 57 278)" />
      <circle cx="190" cy="24" r="5" fill="#FF8FB1" />
      <circle cx="352" cy="300" r="4" fill="#FFC531" />
    </svg>
  );
}
