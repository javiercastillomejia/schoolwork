import { useEffect, useRef, useState, type FormEvent } from 'react';
import { pastSpeech, type Verb } from '../data/verbs';
import { checkPast, type Verdict } from '../engine/answers';
import { speak } from '../lib/speech';
import { Feedback } from './Feedback';
import { QuestionPrompt } from './QuestionPrompt';

interface Props {
  verb: Verb;
  name: string;
  autoSpeak: boolean;
  retry: boolean;
  /** Enseñar la primera letra como pista (los más pequeños). */
  hint: boolean;
  onAnswer: (correct: boolean) => boolean;
  onContinue: () => void;
}

export function WriteQuestion({ verb, name, autoSpeak, retry, hint, onAnswer, onContinue }: Props) {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [willRetry, setWillRetry] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    if (autoSpeak) speak(`to ${verb.base}`);
  }, [verb, autoSpeak]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (verdict || value.trim() === '') return;
    const result = checkPast(verb, value);
    setVerdict(result);
    if (autoSpeak) speak(pastSpeech(verb));
    setWillRetry(onAnswer(result.correct));
  }

  const state = verdict ? (verdict.correct ? 'is-correct' : 'is-wrong') : '';
  const firstLetter = verb.past[0]?.[0] ?? '';

  return (
    <>
      <QuestionPrompt verb={verb} question="Escribe el pasado de…" />
      <form className="write" onSubmit={submit}>
        <label className="field-label" htmlFor="answer">
          Tu respuesta
        </label>
        <input
          id="answer"
          ref={input}
          className={`write-input ${state}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          readOnly={verdict !== null}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="done"
          lang="en"
          placeholder="Escribe aquí…"
        />
        {!verdict && verb.needsAll && <p className="note">Escribe las dos formas, separadas por «/».</p>}
        {!verdict && hint && !verb.needsAll && (
          <p className="note">
            Pista: empieza por «<strong lang="en">{firstLetter}</strong>».
          </p>
        )}
        {!verdict && (
          <button type="submit" className="btn btn-primary btn-block" disabled={value.trim() === ''}>
            Comprobar
          </button>
        )}
      </form>
      {verdict && (
        <Feedback
          verb={verb}
          verdict={verdict}
          name={name}
          onContinue={onContinue}
          showTiles
          earnedStar={verdict.correct && !retry}
          willRetry={willRetry}
        />
      )}
    </>
  );
}
