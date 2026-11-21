import { useEffect, useMemo, useState } from 'react';
import { correctOption, optionsFor } from '../core/quiz';
import type { Question, Topic } from '../core/types';
import { pick } from '../lib/random';
import { speak } from '../lib/speech';
import type { MascotInfo } from '../mascots/types';
import { Feedback } from './Feedback';
import { Icon } from './Icon';
import { SpeakButton } from './SpeakButton';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

interface Props {
  question: Question;
  topic: Topic | undefined;
  optionCount: number;
  hints: boolean;
  name: string;
  mascot: MascotInfo;
  lang: string;
  autoSpeak: boolean;
  retry: boolean;
  /** Guarda la respuesta; devuelve si la pregunta se repetirá en esta sesión. */
  onAnswer: (correct: boolean, usedHint: boolean) => boolean;
  onContinue: () => void;
}

/** Una pregunta de elegir con corrección inmediata y explicación. */
export function QuestionCard({ question, topic, optionCount, hints, name, mascot, lang, autoSpeak, retry, onAnswer, onContinue }: Props) {
  const options = useMemo(() => optionsFor(question, optionCount), [question, optionCount]);
  const correct = correctOption(question);
  const [removed, setRemoved] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [willRetry, setWillRetry] = useState(false);

  useEffect(() => {
    if (autoSpeak) speak(question.text, lang);
  }, [question, autoSpeak, lang]);

  function choose(option: string) {
    if (chosen || option === removed) return;
    setChosen(option);
    setWillRetry(onAnswer(option === correct, removed !== null));
  }

  function takeHint() {
    if (removed || chosen) return;
    setRemoved(pick(options.filter((o) => o !== correct)));
  }

  // Teclado: 1–4 (o A–D) para elegir.
  useEffect(() => {
    if (chosen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key.toUpperCase();
      const index = /^[1-9]$/.test(key) ? Number(key) - 1 : LETTERS.indexOf(key);
      const option = options[index];
      if (option) choose(option);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const canHint = hints && options.length > 2 && !removed && !chosen;

  return (
    <>
      <section className="question" aria-labelledby={`q-${question.id}`}>
        {topic && (
          <span className="topic-chip">
            <span aria-hidden="true">{topic.emoji}</span> {topic.title}
          </span>
        )}
        <div className="question-row">
          <h1 id={`q-${question.id}`} className="question-text" lang={lang}>
            {question.text}
          </h1>
          <SpeakButton text={question.text} label="la pregunta" lang={lang} />
        </div>
      </section>

      <div className="options" role="group" aria-label="Opciones" lang={lang}>
        {options.map((option, i) => {
          let state = '';
          if (chosen) {
            if (option === correct) state = 'is-correct';
            else if (option === chosen) state = 'is-wrong';
            else state = 'is-dim';
          } else if (option === removed) state = 'is-removed';
          return (
            <button
              key={option}
              type="button"
              className={`option ${state}`}
              onClick={() => choose(option)}
              disabled={chosen !== null || option === removed}
            >
              <span className="option-letter" aria-hidden="true">
                {state === 'is-correct' ? <Icon name="check" size={18} strokeWidth={3.5} /> : state === 'is-wrong' ? <Icon name="close" size={16} strokeWidth={3.5} /> : LETTERS[i]}
              </span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {canHint && (
        <button type="button" className="hint-btn" onClick={takeHint}>
          <Icon name="bulb" size={20} strokeWidth={2.4} /> Pista: quitar una opción
        </button>
      )}
      {retry && !chosen && <p className="retry-note">¡Otra vez esta! Ahora sí.</p>}

      {chosen && (
        <Feedback
          correct={chosen === correct}
          answer={correct}
          why={question.why}
          name={name}
          mascot={mascot}
          lang={lang}
          earned={chosen === correct && !retry && removed === null}
          willRetry={willRetry}
          onContinue={onContinue}
        />
      )}
    </>
  );
}
