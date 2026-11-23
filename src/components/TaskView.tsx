import { useEffect, useState } from 'react';
import { orderedIndexes, slots, type Body, type Checked, type Expect, type Response, type Task } from '../core/task';
import type { Topic } from '../core/types';
import { f } from '../lib/frac';
import { plain } from '../lib/text';
import { Figure, ShapeFigure } from './Figure';
import { Icon } from './Icon';
import { Rich } from './Rich';
import { SpeakButton } from './SpeakButton';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export type Phase = 'answer' | 'checked';

export interface TaskViewProps {
  task: Task;
  response: Response;
  onChange: (response: Response) => void;
  phase: Phase;
  checked?: Checked;
  lang: string;
  topic?: Topic;
  /** Examen: elegir solo marca la opción (no se corrige al momento). */
  exam?: boolean;
  /** Opción quitada con la pista. */
  removed?: string | null;
  /** Al elegir una opción en práctica (se corrige al momento). */
  onChoose?: (option: string) => void;
  /** Intro en una casilla: comprobar. */
  onSubmit?: () => void;
}

/** Un ejercicio: enunciado, dibujo y la forma de contestar que toque. */
export function TaskView(props: TaskViewProps) {
  const { task, lang, topic } = props;
  return (
    <>
      <section className="question" aria-label="Ejercicio">
        <div className="question-chips">
          {topic && !(topic.sheet && task.source) && (
            <span className="topic-chip">
              <span aria-hidden="true">{topic.emoji}</span> {topic.title}
            </span>
          )}
          {task.source && <span className="topic-chip source-chip">{task.source}</span>}
        </div>
        <div className="question-row">
          <h1 className="question-text" lang={lang}>
            <Rich text={task.text} />
          </h1>
          <SpeakButton text={plain(task.text, lang)} label="el enunciado" lang={lang} />
        </div>
        {task.figure && (
          <div className="figure-box">
            <Figure figure={task.figure} />
          </div>
        )}
      </section>
      <BodyView {...props} body={task.body} />
    </>
  );
}

function BodyView(props: TaskViewProps & { body: Body }) {
  const { body } = props;
  switch (body.type) {
    case 'choice':
      return <ChoiceBody {...props} body={body} />;
    case 'fields':
      return <FieldsBody {...props} body={body} />;
    case 'rows':
      return <RowsBody {...props} body={body} />;
    case 'order':
      return <OrderBody {...props} body={body} />;
    case 'classify':
      return <ClassifyBody {...props} body={body} />;
    case 'pairs':
      return <PairsBody {...props} body={body} />;
    case 'color':
      return <ColorBody {...props} body={body} />;
  }
}

// ---------- Elegir ----------

function ChoiceBody({ body, response, onChange, phase, lang, exam, removed, onChoose }: TaskViewProps & { body: Extract<Body, { type: 'choice' }> }) {
  const chosen = response.type === 'choice' ? response.value : null;
  const answering = phase === 'answer';

  function choose(option: string) {
    if (!answering || option === removed) return;
    onChange({ type: 'choice', value: option });
    if (!exam) onChoose?.(option);
  }

  // Teclado: 1–4 (o A–D) para elegir.
  useEffect(() => {
    if (!answering) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if ((event.target as HTMLElement).tagName === 'INPUT') return;
      const key = event.key.toUpperCase();
      const index = /^[1-9]$/.test(key) ? Number(key) - 1 : LETTERS.indexOf(key);
      const option = body.options[index];
      if (option) choose(option);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const short = body.options.every((o) => plain(o).length <= 6);

  return (
    <div className={`options ${short ? 'options-grid' : ''}`} role={exam ? 'radiogroup' : 'group'} aria-label="Opciones" lang={lang}>
      {body.options.map((option, i) => {
        let state = '';
        if (!answering) {
          if (option === body.correct) state = 'is-correct';
          else if (option === chosen) state = 'is-wrong';
          else state = 'is-dim';
        } else if (option === removed) state = 'is-removed';
        else if (exam && option === chosen) state = 'is-selected';
        return (
          <button
            key={option}
            type="button"
            role={exam ? 'radio' : undefined}
            aria-checked={exam ? option === chosen : undefined}
            className={`option ${state}`}
            onClick={() => choose(option)}
            disabled={!answering || option === removed}
          >
            <span className="option-letter" aria-hidden="true">
              {state === 'is-correct' ? (
                <Icon name="check" size={18} strokeWidth={3.5} />
              ) : state === 'is-wrong' ? (
                <Icon name="close" size={16} strokeWidth={3.5} />
              ) : (
                LETTERS[i]
              )}
            </span>
            <span className="option-text">
              <Rich text={option} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Escribir ----------

function Box({
  value,
  onChange,
  label,
  disabled,
  wide = false,
  onEnter,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled: boolean;
  wide?: boolean;
  onEnter?: () => void;
}) {
  return (
    <input
      className={`box ${wide ? 'box-wide' : ''}`}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^\d,.\-]/g, '').slice(0, 9))}
      onKeyDown={(event) => event.key === 'Enter' && onEnter?.()}
      inputMode={wide ? 'decimal' : 'numeric'}
      aria-label={label}
      disabled={disabled}
      autoComplete="off"
    />
  );
}

function AnswerInput({
  expect,
  values,
  onChange,
  disabled,
  label,
  onEnter,
}: {
  expect: Expect;
  values: string[];
  onChange: (values: string[]) => void;
  disabled: boolean;
  label: string;
  onEnter?: () => void;
}) {
  const set = (i: number) => (v: string) => onChange(values.map((old, j) => (j === i ? v : old)));
  if (expect.type === 'number') {
    return (
      <span className="answer-number">
        <Box value={values[0] ?? ''} onChange={set(0)} label={label} disabled={disabled} wide onEnter={onEnter} />
        {expect.unit && <span className="answer-unit">{expect.unit}</span>}
      </span>
    );
  }
  const offset = expect.type === 'mixed' ? 1 : 0;
  return (
    <span className="answer-frac">
      {expect.type === 'mixed' && (
        <>
          <Box value={values[0] ?? ''} onChange={set(0)} label={`${label}: entero`} disabled={disabled} onEnter={onEnter} />
          <span className="answer-y">y</span>
        </>
      )}
      <span className="stack">
        <Box value={values[offset] ?? ''} onChange={set(offset)} label={`${label}: numerador`} disabled={disabled} onEnter={onEnter} />
        <span className="stack-bar" aria-hidden="true" />
        <Box value={values[offset + 1] ?? ''} onChange={set(offset + 1)} label={`${label}: denominador`} disabled={disabled} onEnter={onEnter} />
      </span>
    </span>
  );
}

function FieldsBody({ body, response, onChange, phase, checked, onSubmit }: TaskViewProps & { body: Extract<Body, { type: 'fields' }> }) {
  if (response.type !== 'fields') return null;
  const answering = phase === 'answer';
  return (
    <div className="fields">
      {body.fields.map((field, i) => {
        const ok = checked?.parts[i];
        const state = answering || ok === undefined ? '' : ok ? 'is-ok' : 'is-oops';
        return (
          <div key={i} className={`field-row ${state}`}>
            {field.figure && (
              <div className="figure-box figure-small">
                <Figure figure={field.figure} />
              </div>
            )}
            <div className="field-line">
              {field.label && (
                <span className="field-label-math">
                  <Rich text={field.label} />
                  <span className="field-eq"> =</span>
                </span>
              )}
              <AnswerInput
                expect={field.expect}
                values={response.values[i] ?? Array.from({ length: slots(field.expect) }, () => '')}
                onChange={(values) => onChange({ type: 'fields', values: response.values.map((v, j) => (j === i ? values : v)) })}
                disabled={!answering}
                label={field.label ? plain(field.label, 'es-ES') : `Respuesta ${i + 1}`}
                onEnter={onSubmit}
              />
              {state && (
                <span className={`mark ${ok ? 'mark-ok' : 'mark-oops'}`} aria-label={ok ? 'Bien' : 'Mal'}>
                  <Icon name={ok ? 'check' : 'close'} size={16} strokeWidth={3.5} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Filas con opciones (p. ej., comparar) ----------

function RowsBody({ body, response, onChange, phase, checked }: TaskViewProps & { body: Extract<Body, { type: 'rows' }> }) {
  if (response.type !== 'rows') return null;
  const answering = phase === 'answer';
  return (
    <div className="rows">
      {body.rows.map((row, i) => {
        const chosen = response.values[i];
        const ok = checked?.parts[i];
        const state = answering || ok === undefined ? '' : ok ? 'is-ok' : 'is-oops';
        const shown = chosen !== null && chosen !== undefined ? row.options[chosen] ?? '○' : '○';
        return (
          <div key={i} className={`row-item ${state}`}>
            <p className="row-label">
              <Rich text={row.label.replace('○', `**${shown}**`)} />
            </p>
            <div className="row-options" role="radiogroup" aria-label={`Fila ${i + 1}`}>
              {row.options.map((option, k) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={chosen === k}
                  className={`chip-option ${chosen === k ? 'is-selected' : ''} ${!answering && k === row.answer ? 'is-answer' : ''}`}
                  disabled={!answering}
                  onClick={() => onChange({ type: 'rows', values: response.values.map((v, j) => (j === i ? k : v)) })}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Ordenar ----------

function OrderBody({ body, response, onChange, phase, checked }: TaskViewProps & { body: Extract<Body, { type: 'order' }> }) {
  if (response.type !== 'order') return null;
  const answering = phase === 'answer';
  const placed = response.value;
  const sign = body.dir === 'asc' ? '<' : '>';
  const expected = orderedIndexes(body.items, body.dir);
  return (
    <div className="order">
      <p className="order-help">
        Toca las fracciones de <strong>{body.dir === 'asc' ? 'menor a mayor' : 'mayor a menor'}</strong>.
        {answering && placed.length > 0 && ' Toca una de abajo para quitarla.'}
      </p>
      <div className="order-pool" aria-label="Fracciones por colocar">
        {body.items.map((item, i) =>
          placed.includes(i) ? (
            <span key={i} className="frac-tile is-ghost" aria-hidden="true" />
          ) : (
            <button
              key={i}
              type="button"
              className="frac-tile"
              disabled={!answering}
              onClick={() => onChange({ type: 'order', value: [...placed, i] })}
            >
              <Rich text={f(item)} />
            </button>
          ),
        )}
      </div>
      <div className="order-line" aria-label="Tu orden">
        {body.items.map((_, pos) => {
          const idx = placed[pos];
          const ok = checked?.parts[pos];
          return (
            <span key={pos} className="order-slot-wrap">
              {pos > 0 && <span className="order-sign">{sign}</span>}
              {idx === undefined ? (
                <span className="frac-tile is-slot" />
              ) : (
                <button
                  type="button"
                  className={`frac-tile is-placed ${!answering ? (ok ? 'is-ok' : 'is-oops') : ''}`}
                  disabled={!answering}
                  onClick={() => onChange({ type: 'order', value: placed.filter((p) => p !== idx) })}
                >
                  <Rich text={f(body.items[idx]!)} />
                </button>
              )}
            </span>
          );
        })}
      </div>
      {!answering && checked && !checked.correct && (
        <p className="order-answer">
          Así: <Rich text={expected.map((i) => f(body.items[i]!)).join(` ${sign} `)} />
        </p>
      )}
    </div>
  );
}

// ---------- Clasificar ----------

function ClassifyBody({ body, response, onChange, phase, checked }: TaskViewProps & { body: Extract<Body, { type: 'classify' }> }) {
  if (response.type !== 'classify') return null;
  const answering = phase === 'answer';
  return (
    <div className="classify">
      {body.items.map((item, i) => {
        const chosen = response.values[i];
        const ok = checked?.parts[i];
        const state = answering || ok === undefined ? '' : ok ? 'is-ok' : 'is-oops';
        return (
          <div key={i} className={`classify-row ${state}`}>
            <span className="classify-frac">
              <Rich text={f(item)} />
            </span>
            <div className="row-options" role="radiogroup" aria-label={plain(f(item), 'es-ES')}>
              {body.bins.map((bin, b) => (
                <button
                  key={bin}
                  type="button"
                  role="radio"
                  aria-checked={chosen === b}
                  className={`chip-option chip-small ${chosen === b ? 'is-selected' : ''} ${!answering && body.answers[i] === b ? 'is-answer' : ''}`}
                  disabled={!answering}
                  onClick={() => onChange({ type: 'classify', values: response.values.map((v, j) => (j === i ? b : v)) })}
                >
                  {bin}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Unir parejas ----------

const PAIR_COLORS = 4;

function PairsBody({ body, response, onChange, phase, checked }: TaskViewProps & { body: Extract<Body, { type: 'pairs' }> }) {
  const [selected, setSelected] = useState<number | null>(null);
  if (response.type !== 'pairs') return null;
  const answering = phase === 'answer';
  const partner = response.partner;

  // Cada pareja hecha tiene su color, según el orden en que se formó.
  const pairIds = new Map<number, number>();
  let next = 0;
  partner.forEach((p, i) => {
    if (p > i) {
      pairIds.set(i, next);
      pairIds.set(p, next);
      next++;
    }
  });

  function tap(i: number) {
    if (!answering) return;
    const p = partner[i]!;
    if (p >= 0) {
      onChange({ type: 'pairs', partner: partner.map((v, j) => (j === i || j === p ? -1 : v)) });
      setSelected(null);
      return;
    }
    if (selected === null) setSelected(i);
    else if (selected === i) setSelected(null);
    else {
      onChange({ type: 'pairs', partner: partner.map((v, j) => (j === i ? selected : j === selected ? i : v)) });
      setSelected(null);
    }
  }

  return (
    <div className="pairs-task">
      <p className="order-help">Toca dos fracciones equivalentes para unirlas. Toca una unida para separarla.</p>
      <div className="pair-grid">
        {body.items.map((item, i) => {
          const id = pairIds.get(i);
          const ok = checked?.parts[i];
          return (
            <button
              key={i}
              type="button"
              className={`frac-tile pair-tile ${selected === i ? 'is-picked' : ''} ${id !== undefined ? `pair-${id % PAIR_COLORS}` : ''} ${!answering ? (ok ? 'is-ok' : 'is-oops') : ''}`}
              aria-pressed={selected === i || id !== undefined}
              disabled={!answering}
              onClick={() => tap(i)}
            >
              <Rich text={f(item)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Colorear ----------

function ColorBody({ body, response, onChange, phase, checked }: TaskViewProps & { body: Extract<Body, { type: 'color' }> }) {
  if (response.type !== 'color') return null;
  const answering = phase === 'answer';
  return (
    <div className="color-task">
      {body.figures.map((fig, i) => {
        const filled = response.values[i] ?? [];
        const count = filled.filter(Boolean).length;
        const ok = checked?.parts[i];
        const state = answering || ok === undefined ? '' : ok ? 'is-ok' : 'is-oops';
        return (
          <div key={i} className={`color-item ${state}`}>
            {fig.label && (
              <p className="color-label">
                <Rich text={fig.label} />
              </p>
            )}
            <ShapeFigure
              shape={fig.shape}
              parts={fig.parts}
              filled={filled}
              label={`Figura de ${fig.parts} trozos para colorear`}
              onToggle={
                answering
                  ? (k) => onChange({ type: 'color', values: response.values.map((v, j) => (j === i ? v.map((b, m) => (m === k ? !b : b)) : v)) })
                  : undefined
              }
            />
            <p className="color-count">
              {fig.shape === 'dots' || fig.shape === 'squares' ? 'Rodeadas' : 'Coloreados'}: {count} de {fig.parts}
              {state === 'is-oops' && ` (eran ${fig.target})`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
