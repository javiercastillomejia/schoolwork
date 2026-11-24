import { useEffect } from 'react';
import { FAMILIES, VERBS, pastLabel, pastSpeech, splitExample, type Verb } from '../data/verbs';
import { speak } from '../lib/speech';
import { Icon } from './Icon';
import { MeaningChips } from './MeaningChips';
import { SpeakButton } from './SpeakButton';

interface Props {
  verb: Verb;
  autoSpeak: boolean;
  onDone: () => void;
}

export function PresentCard({ verb, autoSpeak, onDone }: Props) {
  const family = FAMILIES[verb.family];
  const relatives = VERBS.filter((other) => other.family === verb.family && other.id !== verb.id).slice(0, 3);
  const [before, past, after] = splitExample(verb);

  useEffect(() => {
    if (autoSpeak) speak(`to ${verb.base}. ${pastSpeech(verb)}`);
  }, [verb, autoSpeak]);

  return (
    <>
      <section className="card present" aria-labelledby="present-verb">
        <span className="sticker">
          <Icon name="sparkle" size={16} /> ¡Verbo nuevo! · Semana {verb.week}
        </span>

        <span className="form-label">Infinitivo</span>
        <div className="verb-row">
          <h1 id="present-verb" className="verb" lang="en">
            to {verb.base}
          </h1>
          <SpeakButton text={`to ${verb.base}`} label={`to ${verb.base}`} />
        </div>

        <span className="form-arrow">
          <Icon name="arrowDown" size={18} strokeWidth={3} />
        </span>

        <span className="form-label">Pasado</span>
        <div className="verb-row">
          <p className="verb verb-past" lang="en">
            {pastLabel(verb)}
          </p>
          <SpeakButton text={pastSpeech(verb)} label={pastLabel(verb)} />
        </div>

        <MeaningChips verb={verb} />

        {verb.needsAll && <p className="note">Hay que saberse las dos: was (I, he, she, it) y were (you, we, they).</p>}
        {verb.past.length > 1 && !verb.needsAll && <p className="note">Las dos formas son correctas.</p>}
        {verb.pastSpeech && <p className="note">Se escribe igual, pero en pasado se pronuncia «{verb.pastSpeech}».</p>}
      </section>

      <section className="family" aria-labelledby="family-name">
        <h2 id="family-name" className="family-name">
          {verb.family === 'unique' ? 'Verbo único' : `Familia: ${family.name}`}
        </h2>
        {verb.family !== 'unique' && (
          <div className="family-chips" lang="en">
            {relatives.map((other) => (
              <span key={other.id} className="family-chip">
                {other.base} → {other.past[0]}
              </span>
            ))}
          </div>
        )}
        <p className="family-hint">
          {verb.family === 'unique' ? 'No sigue ningún patrón: este hay que memorizarlo.' : family.hint}
        </p>
      </section>

      <section className="example" aria-label="Ejemplo">
        <div className="example-text">
          <p lang="en">
            {before}
            <strong>{past}</strong>
            {after}
          </p>
          <p className="muted">{verb.exampleEs}</p>
        </div>
        <SpeakButton text={`${before}${verb.pastSpeech ?? past}${after}`} label="la frase" />
      </section>

      <button type="button" className="btn btn-primary btn-block btn-bottom" onClick={onDone} autoFocus>
        ¡Entendido!
      </button>
    </>
  );
}
