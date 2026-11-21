import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { SpeakButton } from '../components/SpeakButton';
import { shuffle } from '../lib/random';
import { speak } from '../lib/speech';
import type { UnitScreenProps } from './types';

/** Fichas del glosario: palabra y traducción delante, definición detrás. */
export function Cards({ unit, settings, back }: UnitScreenProps) {
  const [deck, setDeck] = useState(() => shuffle(unit.glossary));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const term = deck[index]!;

  const move = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => (i + delta + deck.length) % deck.length);
    },
    [deck.length],
  );

  const flip = useCallback(() => setFlipped((f) => !f), []);

  useEffect(() => {
    if (settings.autoSpeak) speak(flipped ? term.definition : term.word, unit.lang);
  }, [term, flipped, settings.autoSpeak, unit.lang]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') move(1);
      else if (event.key === 'ArrowLeft') move(-1);
      else if ((event.key === ' ' || event.key === 'Enter') && (event.target as HTMLElement).tagName !== 'BUTTON') {
        event.preventDefault();
        flip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, flip]);

  return (
    <main className="screen cards-screen">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={back} aria-label="Volver">
          <Icon name="back" strokeWidth={3} />
        </button>
        <span className="topbar-title">
          <span className="section-title">Fichas</span>
          <span className="muted small"> · {unit.glossary.length} palabras</span>
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            setDeck(shuffle(unit.glossary));
            setIndex(0);
            setFlipped(false);
          }}
          aria-label="Barajar"
        >
          <Icon name="shuffle" size={22} strokeWidth={2.4} />
        </button>
      </header>

      <p className="cards-count" aria-live="polite">
        {index + 1} / {deck.length}
      </p>

      <div className="flip-wrap">
        <div
          className={`flip-card ${flipped ? 'is-flipped' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={flipped ? `${term.word}: ${term.definition}. Toca para dar la vuelta.` : `${term.word}, ${term.translation}. Toca para ver la definición.`}
          onClick={flip}
          onKeyDown={(event) => {
            if (event.key === ' ' || event.key === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
              flip();
            }
          }}
        >
          <div className="flip-face flip-front" aria-hidden={flipped}>
            <span className="form-label">Word</span>
            <p className="flip-word" lang={unit.lang}>
              {term.word}
            </p>
            <p className="flip-translation">{term.translation}</p>
            <span className="flip-hint">
              <Icon name="flip" size={18} strokeWidth={2.4} /> Toca para ver la definición
            </span>
          </div>
          <div className="flip-face flip-back" aria-hidden={!flipped}>
            <span className="form-label" lang={unit.lang}>
              {term.word}
            </span>
            <p className="flip-definition" lang={unit.lang}>
              {term.definition}
            </p>
            <span className="flip-hint">
              <Icon name="flip" size={18} strokeWidth={2.4} /> Toca para volver
            </span>
          </div>
        </div>
      </div>

      <div className="cards-speak">
        <SpeakButton text={flipped ? term.definition : term.word} label={flipped ? 'la definición' : 'la palabra'} lang={unit.lang} />
      </div>

      <div className="cards-nav">
        <button type="button" className="btn btn-secondary" onClick={() => move(-1)} aria-label="Anterior">
          <Icon name="back" size={22} strokeWidth={3} /> Anterior
        </button>
        <button type="button" className="btn btn-primary" onClick={() => move(1)} aria-label="Siguiente">
          Siguiente <Icon name="forward" size={22} strokeWidth={3} />
        </button>
      </div>
      <p className="fine-print">En el ordenador: espacio para girar y flechas para pasar.</p>
    </main>
  );
}
