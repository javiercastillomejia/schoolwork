import { useEffect, useState } from 'react';
import { Confetti } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { Mascot, MascotSays } from '../components/Mascot';
import { SessionBar } from '../components/SessionBar';
import { SpeakButton } from '../components/SpeakButton';
import { Stars } from '../components/Stars';
import { EXAM_LENGTH, profileForAge } from '../core/profile';
import { correctOption, examQuestions, formatGrade, gradeLabel, gradeOf, optionsFor, percentOf, starsFor } from '../core/quiz';
import { applyFreeAnswer, cardOf, dayNumber } from '../core/srs';
import type { Question } from '../core/types';
import { speak } from '../lib/speech';
import { addExam, markStudied } from '../storage/store';
import type { UnitScreenProps } from './types';

interface Paper {
  questions: Question[];
  options: string[][];
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Examen final como en clase: 20 preguntas de toda la unidad, sin corrección hasta el final. */
export function Exam(props: UnitScreenProps) {
  const { unit, subject, progress, settings, update, updateUnit, back, go, at } = props;
  const [phase, setPhase] = useState<'intro' | 'questions' | 'results'>('intro');
  const [paper] = useState<Paper>(() => {
    const questions = examQuestions(unit);
    const count = profileForAge(settings.age).options;
    return { questions, options: questions.map((q) => optionsFor(q, count)) };
  });
  const [answers, setAnswers] = useState<(string | null)[]>(() => paper.questions.map(() => null));
  const [index, setIndex] = useState(0);
  const [today] = useState(dayNumber);
  const { mascot } = subject;
  const last = progress.exams[progress.exams.length - 1];
  const best = progress.exams.reduce<number | undefined>((m, e) => (m === undefined || e.grade > m ? e.grade : m), undefined);

  const question = paper.questions[index];
  const chosen = answers[index] ?? null;

  useEffect(() => {
    if (phase === 'questions' && question && settings.autoSpeak) speak(question.text, unit.lang);
  }, [phase, question, settings.autoSpeak, unit.lang]);

  function finish() {
    const correct = paper.questions.map((q, i) => answers[i] === correctOption(q));
    const right = correct.filter(Boolean).length;
    const total = paper.questions.length;
    updateUnit((u) => {
      const cards = { ...u.cards };
      paper.questions.forEach((q, i) => (cards[q.id] = applyFreeAnswer(cardOf(cards, q.id), correct[i]!, today)));
      return {
        ...u,
        cards,
        rewards: u.rewards + right,
        exams: addExam(u.exams, { grade: gradeOf(right, total), percent: percentOf(right, total), day: today }),
      };
    });
    update((s) => markStudied(s, today));
    setPhase('results');
    window.scrollTo(0, 0);
  }

  if (phase === 'intro') {
    return (
      <main className="screen exam-intro">
        <header className="topbar">
          <button type="button" className="icon-btn" onClick={back} aria-label="Volver">
            <Icon name="back" strokeWidth={3} />
          </button>
          <span className="topbar-title muted small" lang="en">
            {unit.label} · Final test
          </span>
          <span className="topbar-spacer" />
        </header>
        <h1 className="title">Examen final</h1>
        <MascotSays mascot={mascot}>
          {paper.questions.length} preguntas al azar de toda la unidad. Como en clase: no te diré si están bien hasta el
          final. ¡Tú puedes, {settings.name}!
        </MascotSays>
        <div className="stat-tiles">
          <span className="stat-tile tint-a">
            <strong>{paper.questions.length}</strong> preguntas
          </span>
          <span className="stat-tile tint-b">
            <strong>{last ? formatGrade(last.grade) : '–'}</strong> última nota
          </span>
          <span className="stat-tile tint-c">
            <strong>{best !== undefined ? formatGrade(best) : '–'}</strong> mejor nota
          </span>
        </div>
        <p className="muted small">Puedes volver atrás y cambiar respuestas antes de terminar. Las que falles volverán a tus repasos.</p>
        <button type="button" className="btn btn-primary btn-block btn-big btn-bottom" onClick={() => setPhase('questions')}>
          Empezar el examen <Icon name="arrowRight" size={22} strokeWidth={3} />
        </button>
      </main>
    );
  }

  if (phase === 'results') {
    const right = paper.questions.filter((q, i) => answers[i] === correctOption(q)).length;
    const total = paper.questions.length;
    const grade = gradeOf(right, total);
    const stars = starsFor(percentOf(right, total));
    const missedIds = paper.questions.filter((q, i) => answers[i] !== correctOption(q)).map((q) => q.id);
    return (
      <main className="screen summary exam-results">
        {stars > 0 && <Confetti />}
        <Mascot mascot={mascot} mood={stars >= 2 ? 'party' : stars === 1 ? 'happy' : 'normal'} size={170} />
        <p className="grade" aria-label={`Nota: ${formatGrade(grade)} sobre 10`}>
          {formatGrade(grade)}
          <span>/10</span>
        </p>
        <h1 className="title">{gradeLabel(grade)}</h1>
        <p className="summary-score">
          {right} de {total} bien · +{right} {right === 1 ? mascot.reward.one : mascot.reward.many}
        </p>
        <Stars count={stars} size={46} />

        <section className="card corrected" aria-labelledby="corrected-title">
          <h2 id="corrected-title" className="section-title">
            Corrección
          </h2>
          <ol lang={unit.lang}>
            {paper.questions.map((q, i) => {
              const ok = answers[i] === correctOption(q);
              return (
                <li key={q.id} className={ok ? 'is-ok' : 'is-oops'}>
                  <span className="corrected-mark" aria-label={ok ? 'Bien' : 'Mal'}>
                    <Icon name={ok ? 'check' : 'close'} size={16} strokeWidth={3.5} />
                  </span>
                  <div>
                    <p className="corrected-q">{q.text}</p>
                    {ok ? (
                      <p className="corrected-a">{correctOption(q)}</p>
                    ) : (
                      <>
                        <p className="corrected-given">
                          <s>{answers[i] ?? '—'}</s>
                        </p>
                        <p className="corrected-a">{correctOption(q)}</p>
                        <p className="corrected-why">{q.why}</p>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="summary-actions">
          {missedIds.length > 0 && (
            <button
              type="button"
              className="btn btn-primary btn-block btn-big"
              onClick={() => go({ name: 'session', ...at, request: { kind: 'mistakes', questionIds: missedIds } }, { replace: true })}
            >
              Practicar mis fallos ({missedIds.length}) <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-block" onClick={() => go({ name: 'exam', ...at }, { replace: true })}>
            <Icon name="retry" size={20} strokeWidth={2.6} /> Otro examen
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={back}>
            Volver
          </button>
        </div>
      </main>
    );
  }

  if (!question) return null;
  const isLast = index === paper.questions.length - 1;
  const answered = answers.filter((a) => a !== null).length;
  const topic = unit.topics.find((t) => t.id === question.topic);

  return (
    <main className="screen session exam">
      <SessionBar index={index} total={paper.questions.length} onExit={back} />
      <section className="question">
        {topic && (
          <span className="topic-chip">
            <span aria-hidden="true">{topic.emoji}</span> {topic.title}
          </span>
        )}
        <div className="question-row">
          <h1 className="question-text" lang={unit.lang}>
            {question.text}
          </h1>
          <SpeakButton text={question.text} label="la pregunta" lang={unit.lang} />
        </div>
      </section>

      <div className="options" role="radiogroup" aria-label="Opciones" lang={unit.lang}>
        {paper.options[index]!.map((option, i) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={chosen === option}
            className={`option ${chosen === option ? 'is-selected' : ''}`}
            onClick={() => setAnswers((a) => a.map((v, j) => (j === index ? option : v)))}
          >
            <span className="option-letter" aria-hidden="true">
              {LETTERS[i]}
            </span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>

      <div className="exam-nav">
        <button type="button" className="btn btn-secondary" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
          <Icon name="back" size={20} strokeWidth={3} /> Anterior
        </button>
        {isLast ? (
          <button type="button" className="btn btn-primary" onClick={finish} disabled={answered < paper.questions.length}>
            Terminar <Icon name="check" size={20} strokeWidth={3} />
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setIndex((i) => i + 1)} disabled={chosen === null}>
            Siguiente <Icon name="arrowRight" size={20} strokeWidth={3} />
          </button>
        )}
      </div>
      {isLast && answered < paper.questions.length && (
        <p className="fine-print">Te faltan {paper.questions.length - answered} por contestar.</p>
      )}
      <p className="fine-print">
        {answered} de {EXAM_LENGTH} contestadas
      </p>
    </main>
  );
}
