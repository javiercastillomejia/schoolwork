import { FAMILIES, VERBS, getVerb, pastLabel, pastSpeech, splitExample } from '../data/verbs';
import { dayNumber } from '../engine/srs';
import type { Progress } from '../storage/progress';
import { Icon } from '../components/Icon';
import { MeaningChips } from '../components/MeaningChips';
import { SpeakButton } from '../components/SpeakButton';
import { STATUS_LABEL, statusOf } from '../components/status';

interface Props {
  verbId: number;
  progress: Progress;
  onBack: () => void;
  /** Practicar (si ya lo ha estudiado) o aprender (si aún no) este verbo. */
  onPractice: (verbId: number, seen: boolean) => void;
}

function nextReviewLabel(due: number, today: number): string {
  const days = due - today;
  if (days <= 0) return 'hoy';
  if (days === 1) return 'mañana';
  return `en ${days} días`;
}

export function VerbDetail({ verbId, progress, onBack, onPractice }: Props) {
  const verb = getVerb(verbId);
  const card = progress.cards[verbId];
  const status = statusOf(card);
  const seen = status !== 'unseen';
  const family = FAMILIES[verb.family];
  const relatives = VERBS.filter((other) => other.family === verb.family && other.id !== verb.id).slice(0, 3);
  const [before, past, after] = splitExample(verb);

  return (
    <main className="screen verb-detail">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Volver a Mis verbos">
          <Icon name="back" />
        </button>
        <span className="muted topbar-title small">Mis verbos · Semana {verb.week}</span>
      </header>

      <section className="card present" aria-labelledby="detail-verb">
        <span className={`status-chip status-${status}`}>
          <span className={`dot dot-${status}`} /> {STATUS_LABEL[status]}
        </span>

        <span className="form-label">Infinitivo</span>
        <div className="verb-row">
          <h1 id="detail-verb" className="verb" lang="en">
            to {verb.base}
          </h1>
          <SpeakButton text={`to ${verb.base}`} label={`to ${verb.base}`} />
        </div>

        <span className="form-label">Pasado</span>
        <div className="verb-row">
          <p className="verb verb-past" lang="en">
            {pastLabel(verb)}
          </p>
          <SpeakButton text={pastSpeech(verb)} label={pastLabel(verb)} />
        </div>

        <MeaningChips verb={verb} />
        {verb.needsAll && <p className="note">Hay que saberse las dos: was (I, he, she, it) y were (you, we, they).</p>}
        {verb.pastSpeech && <p className="note">Se escribe igual, pero en pasado se pronuncia «{verb.pastSpeech}».</p>}
      </section>

      {seen && card ? (
        <div className="stat-tiles">
          <span className="stat-tile tint-3">
            <strong>{card.correct}</strong> {card.correct === 1 ? 'acierto' : 'aciertos'}
          </span>
          <span className="stat-tile tint-flame">
            <strong>{card.wrong}</strong> {card.wrong === 1 ? 'fallo' : 'fallos'}
          </span>
          <span className="stat-tile tint-5">
            <strong>{nextReviewLabel(card.due, dayNumber())}</strong> próximo repaso
          </span>
        </div>
      ) : (
        <p className="note">Aún no lo has estudiado. Es de la semana {verb.week}.</p>
      )}

      <section className="family" aria-labelledby="detail-family">
        <h2 id="detail-family" className="family-name">
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

      <button type="button" className="btn btn-primary btn-block btn-big btn-bottom" onClick={() => onPractice(verbId, seen)}>
        {seen ? 'Practicar este verbo' : 'Aprender este verbo'} <Icon name="arrowRight" size={22} strokeWidth={3} />
      </button>
    </main>
  );
}
