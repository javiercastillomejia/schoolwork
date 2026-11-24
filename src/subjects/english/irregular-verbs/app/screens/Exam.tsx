import { useEffect, useRef, useState, type FormEvent } from 'react';
import { VERBS, getVerb } from '../data/verbs';
import {
  buildExam,
  examScore,
  examVerbs,
  fieldText,
  formatGrade,
  gradeRow,
  MAX_EXAM_ROWS,
  scopeKey,
  type CellResult,
  type ExamAnswers,
  type ExamField,
  type ExamRow,
  type ExamScope,
} from '../engine/exam';
import { studiedVerbs, studiedWeeks } from '../engine/review';
import { cardOf } from '../engine/session';
import { applyPracticeAnswer, dayNumber } from '../engine/srs';
import { addExam, lastExam, type Progress } from '../storage/progress';
import { Baco, BacoSays } from '../components/Baco';
import { Icon } from '../components/Icon';

interface Props {
  progress: Progress;
  update: (change: (progress: Progress) => Progress) => void;
  onBack: () => void;
  onPracticeMistakes: (verbIds: number[]) => void;
}

const LABELS: Record<ExamField, string> = { base: 'Infinitivo', past: 'Pasado', meaning: 'Significado' };
const PLACEHOLDERS: Record<ExamField, string> = { base: 'to …', past: 'Escribe el pasado', meaning: 'Escribe el significado' };

function scopeTitle(scope: ExamScope): string {
  return scope.type === 'week' ? `Semana ${scope.week}` : 'Todo lo estudiado';
}

function clock(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function Exam({ progress, update, onBack, onPracticeMistakes }: Props) {
  const { cards, settings } = progress;
  const weeks = studiedWeeks(cards);
  const studiedCount = studiedVerbs(cards).length;

  const [phase, setPhase] = useState<'setup' | 'running' | 'result'>('setup');
  const [scope, setScope] = useState<ExamScope>(() => {
    if (weeks.includes(settings.currentWeek)) return { type: 'week', week: settings.currentWeek };
    const last = weeks[weeks.length - 1];
    return last ? { type: 'week', week: last } : { type: 'all' };
  });
  const [timer, setTimer] = useState(false);
  const [rows, setRows] = useState<ExamRow[]>([]);
  const [answers, setAnswers] = useState<ExamAnswers[]>([]);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [results, setResults] = useState<CellResult[][]>([]);

  useEffect(() => {
    if (phase !== 'running' || !timer) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase, timer]);

  function start() {
    const exam = buildExam(examVerbs(cards, scope, VERBS));
    setRows(exam);
    setAnswers(exam.map(() => ({})));
    setIndex(0);
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase('running');
    window.scrollTo(0, 0);
  }

  function finish() {
    const graded = rows.map((row, i) => gradeRow(row, answers[i] ?? {}));
    const score = examScore(graded);
    const today = dayNumber();
    const perfectRows = graded.filter((cells) => cells.every((cell) => cell.correct)).length;
    update((p) => {
      const nextCards = { ...p.cards };
      rows.forEach((row, i) => {
        const rowCorrect = (graded[i] ?? []).every((cell) => cell.correct);
        nextCards[row.verbId] = applyPracticeAnswer(cardOf(p.cards, row.verbId), rowCorrect, today);
      });
      return {
        ...p,
        cards: nextCards,
        stars: p.stars + perfectRows,
        studyDays: p.studyDays.includes(today) ? p.studyDays : [...p.studyDays, today],
        exams: addExam(p.exams, { key: scopeKey(scope), grade: score.grade, day: today }),
      };
    });
    setResults(graded);
    setNow(Date.now());
    setPhase('result');
    window.scrollTo(0, 0);
  }

  if (phase === 'running') {
    return (
      <ExamRunning
        title={scopeTitle(scope)}
        rows={rows}
        answers={answers}
        index={index}
        elapsed={timer ? now - startedAt : null}
        onAnswer={(field, value) =>
          setAnswers((list) => list.map((a, i) => (i === index ? { ...a, [field]: value } : a)))
        }
        onMove={(to) => {
          setIndex(to);
          window.scrollTo(0, 0);
        }}
        onFinish={finish}
        onQuit={() => {
          if (window.confirm('¿Salir del examen? Se perderán las respuestas.')) onBack();
        }}
      />
    );
  }

  if (phase === 'result') {
    return (
      <ExamResult
        name={settings.name}
        rows={rows}
        results={results}
        elapsed={timer ? now - startedAt : null}
        onPracticeMistakes={onPracticeMistakes}
        onRepeat={() => setPhase('setup')}
        onBack={onBack}
      />
    );
  }

  const last = lastExam(progress.exams, scopeKey(scope));
  const scopeCount = examVerbs(cards, scope, VERBS).length;

  return (
    <main className="screen exam-setup">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Volver">
          <Icon name="back" />
        </button>
        <h1 className="title topbar-title">Examen</h1>
      </header>

      {studiedCount === 0 ? (
        <BacoSays>Primero aprende algún verbo en el reto de hoy y luego podrás examinarte aquí.</BacoSays>
      ) : (
        <>
          <BacoSays size={96}>Como en clase: sin ayudas hasta el final. ¡Tú puedes, {settings.name}!</BacoSays>

          <h2 className="section-title" id="exam-scope">
            ¿De qué es el examen?
          </h2>
          <div className="option-list" role="radiogroup" aria-labelledby="exam-scope">
            <div className={`option-card ${scope.type === 'week' ? 'is-selected' : ''}`}>
              <button
                type="button"
                role="radio"
                aria-checked={scope.type === 'week'}
                className="option-main"
                onClick={() => setScope({ type: 'week', week: scope.type === 'week' ? scope.week : (weeks[0] ?? 1) })}
              >
                <span className="option-title">Una semana</span>
                <span className="muted small">solo lo que has estudiado de ella</span>
              </button>
              <div className="option-chips" role="group" aria-label="Semana">
                {weeks.map((week) => {
                  const selected = scope.type === 'week' && scope.week === week;
                  return (
                    <button
                      key={week}
                      type="button"
                      aria-pressed={selected}
                      className={`pick-chip ${selected ? 'is-selected' : ''}`}
                      onClick={() => setScope({ type: 'week', week })}
                    >
                      Semana {week}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={`option-card ${scope.type === 'all' ? 'is-selected' : ''}`}>
              <button
                type="button"
                role="radio"
                aria-checked={scope.type === 'all'}
                className="option-main"
                onClick={() => setScope({ type: 'all' })}
              >
                <span className="option-title">Todo lo estudiado</span>
                <span className="muted small">
                  {studiedCount > MAX_EXAM_ROWS
                    ? `${MAX_EXAM_ROWS} al azar de tus ${studiedCount} verbos`
                    : `${studiedCount} ${studiedCount === 1 ? 'verbo' : 'verbos'}`}
                </span>
              </button>
            </div>
          </div>

          <section className="sheet-preview" aria-labelledby="exam-format">
            <h2 id="exam-format" className="family-name">
              Como tu hoja
            </h2>
            <div className="sheet-preview-grid" aria-hidden="true">
              <span>Infinitivo</span>
              <span>Pasado</span>
              <span>Significado</span>
              <span className="sheet-preview-given" lang="en">
                to begin
              </span>
              <span className="sheet-preview-blank" />
              <span className="sheet-preview-blank" />
            </div>
            <p className="small">
              En cada fila te damos una casilla y tú escribes las otras dos. En el significado vale cualquiera de los de tu
              hoja.
            </p>
          </section>

          <label className="toggle toggle-card">
            <span>
              <strong>Cronómetro</strong>
              <span className="muted small">Para practicar con prisa, como el día del examen</span>
            </span>
            <input type="checkbox" checked={timer} onChange={(event) => setTimer(event.target.checked)} />
          </label>

          <p className="muted small exam-last">
            {last
              ? `Tu última nota en ${scope.type === 'week' ? `la semana ${scope.week}` : 'todo lo estudiado'}: ${formatGrade(last.grade)}`
              : 'Todavía no has hecho este examen.'}
          </p>

          <button
            type="button"
            className="btn btn-primary btn-block btn-big btn-bottom"
            disabled={scopeCount === 0}
            onClick={start}
          >
            ¡Empezar examen! <Icon name="arrowRight" size={22} strokeWidth={3} />
          </button>
        </>
      )}
    </main>
  );
}

function ExamRunning({
  title,
  rows,
  answers,
  index,
  elapsed,
  onAnswer,
  onMove,
  onFinish,
  onQuit,
}: {
  title: string;
  rows: ExamRow[];
  answers: ExamAnswers[];
  index: number;
  elapsed: number | null;
  onAnswer: (field: ExamField, value: string) => void;
  onMove: (index: number) => void;
  onFinish: () => void;
  onQuit: () => void;
}) {
  const row = rows[index] as ExamRow;
  const verb = getVerb(row.verbId);
  const answer = answers[index] ?? {};
  const isLast = index === rows.length - 1;
  const firstInput = useRef<HTMLInputElement>(null);
  const secondInput = useRef<HTMLInputElement>(null);
  const previous = rows
    .map((r, i) => ({ row: r, answer: answers[i] ?? {}, i }))
    .filter(({ i }) => i < index)
    .slice(-3);

  useEffect(() => {
    firstInput.current?.focus({ preventScroll: true });
  }, [index]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (isLast) onFinish();
    else onMove(index + 1);
  }

  const shown = (r: ExamRow, a: ExamAnswers, field: ExamField) =>
    r.given === field ? fieldText(getVerb(r.verbId), field) : (a[field] ?? '').trim() || '—';
  const blankFields = (['base', 'past', 'meaning'] as ExamField[]).filter((field) => field !== row.given);

  return (
    <main className="screen exam-running">
      <header className="session-bar">
        <button type="button" className="icon-btn" onClick={onQuit} aria-label="Salir del examen">
          <Icon name="close" size={20} strokeWidth={3} />
        </button>
        <h1 className="exam-title">Examen · {title}</h1>
        {elapsed !== null && (
          <span className="exam-clock" aria-label="Tiempo">
            {clock(elapsed)}
          </span>
        )}
      </header>

      {rows.length <= 12 ? (
        <div className="row-dots" aria-hidden="true">
          {rows.map((_, i) => (
            <span key={i} className={i < index ? 'is-done' : i === index ? 'is-current' : ''} />
          ))}
        </div>
      ) : (
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${Math.max(4, Math.round((index / rows.length) * 100))}%` }} />
        </div>
      )}
      <p className="exam-row-count">
        Fila {index + 1} de {rows.length}
      </p>

      <form className="card exam-row" onSubmit={submit} aria-label={`Fila ${index + 1}`}>
        {(['base', 'past', 'meaning'] as ExamField[]).map((field) =>
          field === row.given ? (
            <div key={field} className="exam-field">
              <span className="form-label exam-field-label">
                {LABELS[field]} <span className="exam-given-tag">Te lo damos</span>
              </span>
              <div className="exam-given" lang={field === 'meaning' ? 'es' : 'en'}>
                {fieldText(verb, field)}
              </div>
            </div>
          ) : (
            <div key={field} className="exam-field">
              <label className="form-label" htmlFor={`exam-${field}`}>
                {LABELS[field]}
              </label>
              <input
                id={`exam-${field}`}
                ref={field === blankFields[0] ? firstInput : secondInput}
                onKeyDown={(event) => {
                  // Intro en la primera casilla pasa a la segunda, no a la fila siguiente.
                  if (event.key === 'Enter' && field === blankFields[0]) {
                    event.preventDefault();
                    secondInput.current?.focus();
                  }
                }}
                className="exam-input"
                value={answer[field] ?? ''}
                onChange={(event) => onAnswer(field, event.target.value)}
                placeholder={PLACEHOLDERS[field]}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint={field === blankFields[1] ? (isLast ? 'done' : 'next') : 'next'}
                lang={field === 'meaning' ? 'es' : 'en'}
              />
              {field === 'meaning' && <span className="muted small">Si tiene varios significados, vale cualquiera.</span>}
            </div>
          ),
        )}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>

      {previous.length > 0 && (
        <section className="exam-previous" aria-labelledby="exam-previous-title">
          <h2 id="exam-previous-title" className="exam-previous-title">
            Tus respuestas <span className="muted small">se corrigen al final</span>
          </h2>
          <div className="exam-previous-grid">
            {previous.map(({ row: r, answer: a, i }) => (
              <button key={i} type="button" className="exam-previous-row" onClick={() => onMove(i)}>
                <span lang="en">{shown(r, a, 'base')}</span>
                <span lang="en">{shown(r, a, 'past')}</span>
                <span>{shown(r, a, 'meaning')}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="exam-nav btn-bottom">
        <button type="button" className="btn btn-secondary" disabled={index === 0} onClick={() => onMove(index - 1)}>
          Anterior
        </button>
        <button type="button" className="btn btn-primary" onClick={() => (isLast ? onFinish() : onMove(index + 1))}>
          {isLast ? 'Terminar' : 'Siguiente'} <Icon name="arrowRight" size={22} strokeWidth={3} />
        </button>
      </div>
    </main>
  );
}

function ExamResult({
  name,
  rows,
  results,
  elapsed,
  onPracticeMistakes,
  onRepeat,
  onBack,
}: {
  name: string;
  rows: ExamRow[];
  results: CellResult[][];
  elapsed: number | null;
  onPracticeMistakes: (verbIds: number[]) => void;
  onRepeat: () => void;
  onBack: () => void;
}) {
  const score = examScore(results);
  const grade = formatGrade(score.grade);
  const mistakes = rows.filter((_, i) => (results[i] ?? []).some((cell) => !cell.correct)).map((row) => row.verbId);
  const mood = score.grade >= 7 ? 'party' : score.grade >= 5 ? 'happy' : 'oops';

  return (
    <main className="screen exam-result">
      <div className="exam-result-head">
        <Baco mood={mood} size={104} />
        <div className="exam-result-text">
          <h1 className="title">{score.grade >= 5 ? `¡Un ${grade}, ${name}!` : `Un ${grade}, ${name}`}</h1>
          <div className="exam-result-meta">
            <span className="grade-pill">{score.label}</span>
            <span className="muted small">
              {score.right} de {score.total} casillas{elapsed !== null ? ` · ${clock(elapsed)}` : ''}
            </span>
          </div>
          {score.grade < 5 && <p className="small">¡Practica los fallos y la próxima sale mejor!</p>}
        </div>
      </div>

      <section className="exam-table" aria-label="Examen corregido">
        <div className="exam-table-head" aria-hidden="true">
          <span>Infinitivo</span>
          <span>Pasado</span>
          <span>Significado</span>
        </div>
        {results.map((cells, i) => (
          <div key={i} className="exam-table-row">
            {cells.map((cell) => (
              <span
                key={cell.field}
                className={`exam-cell ${cell.given ? 'is-given' : cell.correct ? 'is-ok' : 'is-bad'}`}
                lang={cell.field === 'meaning' ? 'es' : 'en'}
              >
                {cell.given || cell.correct ? (
                  <>
                    {cell.text}
                    {cell.note && <span className="exam-cell-note">{cell.note}</span>}
                  </>
                ) : (
                  <>
                    <span className="exam-cell-wrong">{cell.text || 'vacío'}</span>
                    <span className="exam-cell-fix">{cell.solution}</span>
                  </>
                )}
              </span>
            ))}
          </div>
        ))}
        <ul className="legend" aria-hidden="true">
          <li>
            <span className="legend-swatch is-given" /> Te la dábamos
          </li>
          <li>
            <span className="legend-swatch is-ok" /> Bien
          </li>
          <li>
            <span className="legend-swatch is-bad" /> A repasar
          </li>
        </ul>
      </section>

      <div className="summary-actions">
        {mistakes.length > 0 && (
          <button type="button" className="btn btn-primary btn-block btn-big" onClick={() => onPracticeMistakes(mistakes)}>
            Practicar mis fallos ({mistakes.length}) <Icon name="arrowRight" size={22} strokeWidth={3} />
          </button>
        )}
        <button type="button" className="btn btn-secondary btn-block" onClick={onRepeat}>
          Otro examen
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={onBack}>
          Volver al inicio
        </button>
      </div>
    </main>
  );
}
