import type { Verb } from '../data/verbs';
import { SpeakButton } from './SpeakButton';

export function QuestionPrompt({ verb, question }: { verb: Verb; question: string }) {
  return (
    <div className="prompt">
      <p className="prompt-question">{question}</p>
      <div className="verb-row">
        <h1 className="verb verb-big" lang="en">
          to {verb.base}
        </h1>
        <SpeakButton text={`to ${verb.base}`} label={`to ${verb.base}`} />
      </div>
      <span className="meaning-chip meaning-chip-plain">{verb.meaning.replace(/\//g, ' / ')}</span>
    </div>
  );
}
