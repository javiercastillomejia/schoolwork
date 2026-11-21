import { useEffect, useRef, useState } from 'react';
import { pick } from '../lib/random';
import type { MascotInfo } from '../mascots/types';
import { Icon } from './Icon';
import { Mascot } from './Mascot';

interface Props {
  correct: boolean;
  /** Respuesta buena. */
  answer: string;
  /** Explicación de la pregunta. */
  why: string;
  name: string;
  mascot: MascotInfo;
  lang: string;
  /** Ha ganado un premio (acierto a la primera, sin pista). */
  earned: boolean;
  /** La pregunta se repetirá dentro de la misma sesión. */
  willRetry: boolean;
  onContinue: () => void;
}

const PRAISE = ['¡Bien hecho, {n}!', '¡Genial, {n}!', '¡Eso es, {n}!', '¡Muy bien, {n}!', '¡Correcto, {n}!'];
const OOPS = ['¡Ups, {n}!', '¡Casi, {n}!', 'No pasa nada, {n}'];

/** Panel que sube desde abajo con la corrección y la explicación. */
export function Feedback({ correct, answer, why, name, mascot, lang, earned, willRetry, onContinue }: Props) {
  const button = useRef<HTMLButtonElement>(null);
  const [title] = useState(() => pick(correct ? PRAISE : OOPS).replace('{n}', name));

  useEffect(() => {
    button.current?.focus({ preventScroll: true });
    button.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, []);

  return (
    <section className={`sheet ${correct ? 'is-ok' : 'is-oops'}`} role="status">
      <div className="sheet-head">
        <Mascot mascot={mascot} mood={correct ? 'happy' : 'oops'} size={88} />
        <div className="sheet-text">
          <p className="sheet-title">{title}</p>
          {!correct && (
            <p className="sheet-answer">
              La buena es: <strong lang={lang}>{answer}</strong>
            </p>
          )}
          {earned && (
            <span className="pill pill-reward">
              <Icon name="leaf" size={16} color="var(--leaf)" /> +1 {mascot.reward.one}
            </span>
          )}
        </div>
      </div>

      <p className="why" lang={lang}>
        <span className="why-label">Why?</span> {why}
      </p>

      {willRetry && <p className="sheet-retry">La repetimos dentro de un ratito para que te salga a la primera.</p>}

      <button ref={button} type="button" className={`btn btn-block ${correct ? 'btn-ok' : 'btn-oops'}`} onClick={onContinue}>
        Seguir
      </button>
    </section>
  );
}
