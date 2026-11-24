import { useState } from 'react';
import { VERBS, WEEKS, pastLabel, verbsOfWeek } from '../data/verbs';
import { isHard, studiedVerbs } from '../engine/review';
import type { Progress } from '../storage/progress';
import { Baco } from '../components/Baco';
import { Icon } from '../components/Icon';
import { STATUS_LABEL, statusOf, type Status } from '../components/status';

interface Props {
  progress: Progress;
  onOpen: (verbId: number) => void;
  onBack: () => void;
}

export function MyVerbs({ progress, onOpen, onBack }: Props) {
  const { cards } = progress;
  const [hardOnly, setHardOnly] = useState(false);
  const studied = studiedVerbs(cards).length;
  const hardCount = VERBS.filter((verb) => isHard(cards[verb.id])).length;

  const weeks = WEEKS.map((week) => {
    const all = verbsOfWeek(week);
    const verbs = hardOnly ? all.filter((verb) => isHard(cards[verb.id])) : all;
    const mastered = all.filter((verb) => statusOf(cards[verb.id]) === 'mastered').length;
    const seen = all.filter((verb) => statusOf(cards[verb.id]) !== 'unseen').length;
    return { week, verbs, note: seen === 0 ? 'Sin empezar' : `${mastered} de ${all.length} dominados` };
  }).filter((group) => group.verbs.length > 0);

  return (
    <main className="screen my-verbs">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Volver">
          <Icon name="back" />
        </button>
        <h1 className="title topbar-title">Mis verbos</h1>
        <span className="muted small">
          {studied} de {VERBS.length} vistos
        </span>
      </header>

      <div className="filter-chips" role="radiogroup" aria-label="Filtro">
        <button
          type="button"
          role="radio"
          aria-checked={!hardOnly}
          className={`filter-chip ${!hardOnly ? 'is-selected' : ''}`}
          onClick={() => setHardOnly(false)}
        >
          Todos
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={hardOnly}
          className={`filter-chip ${hardOnly ? 'is-selected' : ''}`}
          onClick={() => setHardOnly(true)}
        >
          Me cuestan ({hardCount})
        </button>
      </div>

      <ul className="legend" aria-hidden="true">
        {(Object.keys(STATUS_LABEL) as Status[]).map((status) => (
          <li key={status}>
            <span className={`dot dot-${status}`} /> {STATUS_LABEL[status]}
          </li>
        ))}
      </ul>

      {weeks.length === 0 && (
        <div className="empty">
          <Baco mood="happy" size={150} />
          <p>¡Ninguno se te resiste ahora mismo! Los verbos que falles aparecerán aquí.</p>
        </div>
      )}

      {weeks.map((group) => (
        <section key={group.week} className="verb-group" aria-labelledby={`week-${group.week}`}>
          <h2 id={`week-${group.week}`} className="verb-group-title">
            Semana {group.week}
            {!hardOnly && <span className="muted small">{group.note}</span>}
          </h2>
          <ul className="verb-list">
            {group.verbs.map((verb) => {
              const status = statusOf(cards[verb.id]);
              return (
                <li key={verb.id}>
                  <button
                    type="button"
                    className={`verb-item ${status === 'unseen' ? 'is-unseen' : ''}`}
                    onClick={() => onOpen(verb.id)}
                  >
                    <span className={`dot dot-${status}`} role="img" aria-label={STATUS_LABEL[status]} />
                    <span className="verb-item-text">
                      <span className="verb-item-base" lang="en">
                        to {verb.base}
                      </span>
                      <span className="verb-item-meaning">{verb.meaning.replace(/\//g, ' / ')}</span>
                    </span>
                    <span className="verb-item-past" lang="en">
                      {pastLabel(verb)}
                    </span>
                    <Icon name="chevron" size={18} strokeWidth={3} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
