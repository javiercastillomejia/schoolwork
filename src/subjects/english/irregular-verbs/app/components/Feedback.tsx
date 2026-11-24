import { useEffect, useRef, useState } from 'react';
import { pastLabel, type Verb } from '../data/verbs';
import type { Verdict } from '../engine/answers';
import { diffWords, type DiffPart } from '../lib/diff';
import { pick } from '../lib/random';
import { Baco } from './Baco';
import { Icon } from './Icon';

interface Props {
  verb: Verb;
  verdict: Verdict;
  name: string;
  onContinue: () => void;
  /** Mostrar las fichas con las letras que fallan (cuando el alumno ha escrito). */
  showTiles?: boolean;
  /** Ha ganado una estrella (acierto a la primera). */
  earnedStar?: boolean;
  /** El verbo se repetirá dentro de la misma sesión. */
  willRetry?: boolean;
}

const PRAISE = ['¡Bien hecho, {n}!', '¡Genial, {n}!', '¡Eso es, {n}!', '¡Muy bien, {n}!'];

export function Feedback({ verb, verdict, name, onContinue, showTiles = false, earnedStar = false, willRetry = false }: Props) {
  const button = useRef<HTMLButtonElement>(null);
  const [praise] = useState(() => pick(PRAISE).replace('{n}', name));

  useEffect(() => {
    button.current?.focus({ preventScroll: true });
    button.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, []);

  const ok = verdict.correct;
  let title = praise;
  let text: string | null = null;
  if (!verdict.correct) {
    title = verdict.kind === 'typo' ? `¡Casi, ${name}!` : `¡Ups, ${name}!`;
    if (verdict.kind === 'typo') text = 'Fíjate en las letras marcadas.';
    else if (verdict.kind === 'wrong') text = 'La buena es esta:';
    else text = verdict.message;
  }
  const tiles =
    !verdict.correct && showTiles && !verb.needsAll && verdict.kind !== 'missingForm' && verdict.given
      ? diffWords(verdict.given, verdict.closest)
      : null;

  return (
    <section className={`sheet ${ok ? 'is-ok' : 'is-oops'}`} role="status">
      <div className="sheet-head">
        <Baco mood={ok ? 'happy' : 'oops'} size={96} />
        <div className="sheet-text">
          <p className="sheet-title">{title}</p>
          {text && <p className="sheet-message">{text}</p>}
          <p className="sheet-answer" lang="en">
            to {verb.base} → <strong>{pastLabel(verb)}</strong>
            {verb.past.length > 1 && !verb.needsAll && <span className="sheet-note"> (valen las dos)</span>}
          </p>
          {earnedStar && (
            <span className="pill pill-star">
              <Icon name="star" size={16} color="var(--star)" /> +1 estrella
            </span>
          )}
        </div>
      </div>

      {tiles && (
        <div className="tiles" lang="en">
          <span className="tiles-label">Tú</span>
          <Tiles parts={tiles.answer} kind="wrong" />
          <span className="tiles-label">Es</span>
          <Tiles parts={tiles.solution} kind="right" />
        </div>
      )}

      {willRetry && <p className="sheet-retry">Lo repetimos dentro de un ratito para que te salga a la primera.</p>}

      <button ref={button} type="button" className={`btn btn-block ${ok ? 'btn-ok' : 'btn-oops'}`} onClick={onContinue}>
        Seguir
      </button>
    </section>
  );
}

function Tiles({ parts, kind }: { parts: DiffPart[]; kind: 'wrong' | 'right' }) {
  const letters = parts.flatMap((part) => [...part.text].map((letter) => ({ letter, changed: part.changed })));
  return (
    <span className="tile-row">
      {letters.map((item, i) => (
        <span key={i} className={`tile ${item.changed ? `tile-${kind}` : ''}`}>
          {item.letter}
        </span>
      ))}
    </span>
  );
}
