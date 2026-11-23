import { useEffect, useState } from 'react';
import { Confetti } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { Mascot, MascotSays } from '../components/Mascot';
import { Rich } from '../components/Rich';
import { SessionBar } from '../components/SessionBar';
import { Stars } from '../components/Stars';
import { TaskView } from '../components/TaskView';
import { profileForAge } from '../core/profile';
import { examQuestions, formatGrade, gradeLabel, gradeOf, percentOf, starsFor, taskFor } from '../core/quiz';
import { applyFreeAnswer, cardOf, dayNumber } from '../core/srs';
import { answerText, checkTask, emptyResponse, isComplete, type Response, type Task } from '../core/task';
import type { Question } from '../core/types';
import { speak } from '../lib/speech';
import { plain } from '../lib/text';
import { addExam, markStudied } from '../storage/store';
import type { UnitScreenProps } from './types';

interface Paper {
  questions: Question[];
  tasks: Task[];
}

/** Examen final como en clase: preguntas de toda la unidad, sin corrección hasta el final. */
export function Exam(props: UnitScreenProps) {
  const { unit, subject, progress, settings, update, updateUnit, back, go, at } = props;
  const [phase, setPhase] = useState<'intro' | 'questions' | 'results'>('intro');
  const [paper] = useState<Paper>(() => {
    const profile = profileForAge(settings.age);
    // Las hojas de ejercicios largas se practican aparte; el examen mezcla el resto.
    // Si hay ejercicios que salen con números nuevos, el examen se hace con esos: así cada examen es distinto.
    const sheets = new Set(unit.topics.filter((t) => t.sheet).map((t) => t.id));
    const candidates = unit.questions.filter((q) => !sheets.has(q.topic));
    const fresh = candidates.filter((q) => q.kind === 'task' && q.generated);
    const pool = { ...unit, questions: fresh.length >= 20 ? fresh : candidates };
    const questions = examQuestions(pool);
    return { questions, tasks: questions.map((q) => taskFor(q, profile)) };
  });
  const [responses, setResponses] = useState<Response[]>(() => paper.tasks.map(emptyResponse));
  const [index, setIndex] = useState(0);
  const [today] = useState(dayNumber);
  const { mascot } = subject;
  const last = progress.exams[progress.exams.length - 1];
  const best = progress.exams.reduce<number | undefined>((m, e) => (m === undefined || e.grade > m ? e.grade : m), undefined);
  const total = paper.tasks.length;

  const task = paper.tasks[index];
  const question = paper.questions[index];
  const response = responses[index];

  useEffect(() => {
    if (phase === 'questions' && task && settings.autoSpeak) speak(plain(task.text, unit.lang), unit.lang);
  }, [phase, task, settings.autoSpeak, unit.lang]);

  const results = () => paper.tasks.map((t, i) => checkTask(t, responses[i]!).correct);

  function finish() {
    const correct = results();
    const right = correct.filter(Boolean).length;
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
          <span className="topbar-title muted small">{unit.label} · Examen</span>
          <span className="topbar-spacer" />
        </header>
        <h1 className="title">Examen final</h1>
        <MascotSays mascot={mascot}>
          {total} preguntas al azar de toda la unidad. Como en clase: no te diré si están bien hasta el final. ¡Tú puedes,{' '}
          {settings.name}!
        </MascotSays>
        <div className="stat-tiles">
          <span className="stat-tile tint-a">
            <strong>{total}</strong> preguntas
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
    const correct = results();
    const right = correct.filter(Boolean).length;
    const grade = gradeOf(right, total);
    const stars = starsFor(percentOf(right, total));
    const missedIds = paper.questions.filter((_, i) => !correct[i]).map((q) => q.id);
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
            {paper.tasks.map((t, i) => {
              const ok = correct[i];
              return (
                <li key={i} className={ok ? 'is-ok' : 'is-oops'}>
                  <span className="corrected-mark" aria-label={ok ? 'Bien' : 'Mal'}>
                    <Icon name={ok ? 'check' : 'close'} size={16} strokeWidth={3.5} />
                  </span>
                  <div>
                    <p className="corrected-q">
                      <Rich text={t.text} />
                    </p>
                    <p className="corrected-a">
                      <Rich text={answerText(t)} />
                    </p>
                    {!ok && (
                      <p className="corrected-why">
                        <Rich text={t.why} />
                      </p>
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

  if (!task || !question || !response) return null;
  const isLast = index === total - 1;
  const answered = paper.tasks.filter((t, i) => isComplete(t, responses[i]!)).length;
  const complete = isComplete(task, response);

  return (
    <main className="screen session exam">
      <SessionBar index={index} total={total} onExit={back} />
      <TaskView
        key={index}
        task={task}
        topic={unit.topics.find((t) => t.id === question.topic)}
        lang={unit.lang}
        response={response}
        onChange={(next) => setResponses((all) => all.map((r, j) => (j === index ? next : r)))}
        phase="answer"
        exam
      />

      <div className="exam-nav">
        <button type="button" className="btn btn-secondary" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
          <Icon name="back" size={20} strokeWidth={3} /> Anterior
        </button>
        {isLast ? (
          <button type="button" className="btn btn-primary" onClick={finish} disabled={answered < total}>
            Terminar <Icon name="check" size={20} strokeWidth={3} />
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setIndex((i) => i + 1)} disabled={!complete}>
            Siguiente <Icon name="arrowRight" size={20} strokeWidth={3} />
          </button>
        )}
      </div>
      {isLast && answered < total && <p className="fine-print">Te faltan {total - answered} por contestar.</p>}
      <p className="fine-print">
        {answered} de {total} contestadas
      </p>
    </main>
  );
}
