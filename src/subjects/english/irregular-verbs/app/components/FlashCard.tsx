import { useEffect, useRef, useState } from 'react';
import { pastLabel, pastSpeech, type Verb } from '../data/verbs';
import { speak } from '../lib/speech';
import { MeaningChips } from './MeaningChips';
import { SpeakButton } from './SpeakButton';

interface Props {
  verb: Verb;
  autoSpeak: boolean;
  /** Devuelve si la tarjeta volverá a salir en este repaso. */
  onAnswer: (knew: boolean) => boolean;
  onContinue: () => void;
}

/** Tarjeta rápida: se piensa la respuesta, se le da la vuelta y se marca si se sabía. */
export function FlashCard({ verb, autoSpeak, onAnswer, onContinue }: Props) {
  const [flipped, setFlipped] = useState(false);
  const flipButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    flipButton.current?.focus({ preventScroll: true });
    if (autoSpeak) speak(`to ${verb.base}`);
  }, [verb, autoSpeak]);

  function flip() {
    setFlipped(true);
    if (autoSpeak) speak(pastSpeech(verb));
  }

  function answer(knew: boolean) {
    onAnswer(knew);
    onContinue();
  }

  return (
    <>
      <section className="card flashcard" aria-live="polite">
        <span className="form-label">Infinitivo</span>
        <div className="verb-row">
          <h1 className="verb verb-big" lang="en">
            to {verb.base}
          </h1>
          <SpeakButton text={`to ${verb.base}`} label={`to ${verb.base}`} />
        </div>
        <div className="flashcard-divider" aria-hidden="true" />
        {flipped ? (
          <>
            <span className="form-label">Pasado</span>
            <div className="verb-row">
              <p className="verb verb-past" lang="en">
                {pastLabel(verb)}
              </p>
              <SpeakButton text={pastSpeech(verb)} label={pastLabel(verb)} />
            </div>
            <MeaningChips verb={verb} />
          </>
        ) : (
          <>
            <span className="flashcard-mystery" aria-hidden="true">
              ?
            </span>
            <p className="muted">Piensa el pasado y lo que significa.</p>
            <button ref={flipButton} type="button" className="btn btn-primary btn-block" onClick={flip}>
              Dar la vuelta
            </button>
          </>
        )}
      </section>

      {flipped && (
        <div className="flashcard-answer">
          <p className="flashcard-question">¿Te lo sabías?</p>
          <div className="flashcard-buttons">
            <button type="button" className="btn btn-oops-soft" onClick={() => answer(false)}>
              No lo sabía
            </button>
            <button type="button" className="btn btn-ok" onClick={() => answer(true)}>
              ¡Lo sabía!
            </button>
          </div>
          <p className="fine-print">Contesta con sinceridad: los que no sabías volverán antes.</p>
        </div>
      )}
    </>
  );
}
