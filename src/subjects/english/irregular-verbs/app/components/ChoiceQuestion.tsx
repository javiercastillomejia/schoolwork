import { useEffect, useMemo, useState } from 'react';
import { pastSpeech, type Verb } from '../data/verbs';
import { checkPast, type Verdict } from '../engine/answers';
import { pastChoices } from '../engine/distractors';
import { speak } from '../lib/speech';
import { Feedback } from './Feedback';
import { Icon } from './Icon';
import { QuestionPrompt } from './QuestionPrompt';

interface Props {
  verb: Verb;
  name: string;
  autoSpeak: boolean;
  retry: boolean;
  onAnswer: (correct: boolean) => boolean;
  onContinue: () => void;
}

export function ChoiceQuestion({ verb, name, autoSpeak, retry, onAnswer, onContinue }: Props) {
  const { options, correct } = useMemo(() => pastChoices(verb), [verb]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [willRetry, setWillRetry] = useState(false);

  useEffect(() => {
    if (autoSpeak) speak(`to ${verb.base}`);
  }, [verb, autoSpeak]);

  function choose(option: string) {
    if (chosen) return;
    const isCorrect = option === correct;
    setChosen(option);
    setVerdict(isCorrect ? { correct: true } : checkPast(verb, option));
    if (autoSpeak) speak(pastSpeech(verb));
    setWillRetry(onAnswer(isCorrect));
  }

  return (
    <>
      <QuestionPrompt verb={verb} question="¿Cuál es el pasado de…?" />
      <div className="choices" role="group" aria-label="Opciones" lang="en">
        {options.map((option) => {
          let state = '';
          if (chosen) {
            if (option === correct) state = 'is-correct';
            else if (option === chosen) state = 'is-wrong';
            else state = 'is-dim';
          }
          const size = option.length > 10 ? 'is-long' : option.length > 7 ? 'is-medium' : '';
          return (
            <button
              key={option}
              type="button"
              className={`choice ${state} ${size}`}
              onClick={() => choose(option)}
              disabled={chosen !== null}
            >
              {option}
              {state === 'is-correct' && (
                <span className="choice-badge">
                  <Icon name="check" size={17} strokeWidth={3.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {verdict && (
        <Feedback
          verb={verb}
          verdict={verdict}
          name={name}
          onContinue={onContinue}
          earnedStar={verdict.correct && !retry}
          willRetry={willRetry}
        />
      )}
    </>
  );
}
