import { useState } from 'react';
import { FAMILIES, VERBS, type FamilyId } from '../data/verbs';
import { hardVerbs, pickForReview, studiedFamilies, studiedVerbs, studiedWeeks, type ReviewStyle } from '../engine/review';
import type { Progress } from '../storage/progress';
import { BacoSays } from '../components/Baco';
import { Icon } from '../components/Icon';

type What = 'hard' | 'weeks' | 'families';

interface Props {
  progress: Progress;
  onStart: (verbIds: number[], style: ReviewStyle) => void;
  onBack: () => void;
}

const COUNTS = [10, 20, 0];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function Review({ progress, onStart, onBack }: Props) {
  const { cards, settings } = progress;
  const studied = studiedVerbs(cards);
  const hard = hardVerbs(cards);
  const weeks = studiedWeeks(cards);
  const families = studiedFamilies(cards);

  const [what, setWhat] = useState<What>(hard.length > 0 ? 'hard' : 'weeks');
  const [pickedWeeks, setPickedWeeks] = useState<number[]>(() =>
    weeks.includes(settings.currentWeek) ? [settings.currentWeek] : weeks.slice(-1),
  );
  const [pickedFamilies, setPickedFamilies] = useState<FamilyId[]>(() => families.slice(0, 1));
  const [style, setStyle] = useState<ReviewStyle>('cards');
  const [count, setCount] = useState(10);

  if (studied.length === 0) {
    return (
      <main className="screen review">
        <header className="topbar">
          <button type="button" className="icon-btn" onClick={onBack} aria-label="Volver">
            <Icon name="back" />
          </button>
          <h1 className="title topbar-title">Repasar</h1>
        </header>
        <BacoSays>Primero aprende algún verbo en el reto de hoy y luego podrás repasarlo aquí.</BacoSays>
      </main>
    );
  }

  const pool =
    what === 'hard'
      ? hard
      : what === 'weeks'
        ? studied.filter((verb) => pickedWeeks.includes(verb.week))
        : studied.filter((verb) => pickedFamilies.includes(verb.family));
  const total = count > 0 ? Math.min(count, pool.length) : pool.length;

  const options: { id: What; title: string; note: string; disabled?: boolean }[] = [
    {
      id: 'hard',
      title: 'Los que más me cuestan',
      note: hard.length > 0 ? `${hard.length} ${hard.length === 1 ? 'verbo' : 'verbos'}` : 'ninguno ahora',
      disabled: hard.length === 0,
    },
    { id: 'weeks', title: 'Por semanas', note: 'elige una o varias' },
    { id: 'families', title: 'Por familias', note: 'verbos que se parecen' },
  ];

  return (
    <main className="screen review">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Volver">
          <Icon name="back" />
        </button>
        <h1 className="title topbar-title">Repasar</h1>
      </header>

      <BacoSays size={96}>¿Qué repasamos hoy, {settings.name}? Elige tú.</BacoSays>

      <h2 className="section-title" id="review-what">
        ¿Qué verbos?
      </h2>
      <div className="option-list" role="radiogroup" aria-labelledby="review-what">
        {options.map((option) => (
          <div key={option.id} className={`option-card ${what === option.id ? 'is-selected' : ''}`}>
            <button
              type="button"
              role="radio"
              aria-checked={what === option.id}
              className="option-main"
              disabled={option.disabled}
              onClick={() => setWhat(option.id)}
            >
              <span className="option-title">{option.title}</span>
              <span className="muted small">{option.note}</span>
            </button>
            {what === 'weeks' && option.id === 'weeks' && (
              <div className="option-chips" role="group" aria-label="Semanas">
                {weeks.map((week) => (
                  <button
                    key={week}
                    type="button"
                    aria-pressed={pickedWeeks.includes(week)}
                    className={`pick-chip ${pickedWeeks.includes(week) ? 'is-selected' : ''}`}
                    onClick={() => setPickedWeeks((list) => toggle(list, week))}
                  >
                    Semana {week}
                  </button>
                ))}
              </div>
            )}
            {what === 'families' && option.id === 'families' && (
              <div className="option-chips" role="group" aria-label="Familias">
                {families.map((family) => (
                  <button
                    key={family}
                    type="button"
                    aria-pressed={pickedFamilies.includes(family)}
                    className={`pick-chip ${pickedFamilies.includes(family) ? 'is-selected' : ''}`}
                    onClick={() => setPickedFamilies((list) => toggle(list, family))}
                  >
                    {FAMILIES[family].name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="section-title" id="review-how">
        ¿Cómo?
      </h2>
      <div className="how-grid" role="radiogroup" aria-labelledby="review-how">
        {(
          [
            ['cards', 'Tarjetas rápidas', 'Lo piensas y das la vuelta'],
            ['questions', 'Preguntas', 'Elegir y escribir, como en el reto'],
          ] as const
        ).map(([id, title, note]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={style === id}
            className={`option-card option-main ${style === id ? 'is-selected' : ''}`}
            onClick={() => setStyle(id)}
          >
            <span className="option-title">{title}</span>
            <span className="muted small">{note}</span>
          </button>
        ))}
      </div>

      <div className="count-row">
        <h2 className="section-title" id="review-count">
          ¿Cuántos?
        </h2>
        <div className="count-chips" role="radiogroup" aria-labelledby="review-count">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={count === n}
              className={`count-chip ${count === n ? 'is-selected' : ''}`}
              onClick={() => setCount(n)}
            >
              {n === 0 ? 'Todos' : n}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-ok btn-block btn-big btn-bottom"
        disabled={total === 0}
        onClick={() => onStart(pickForReview(pool, cards, count), style)}
      >
        {total === 0 ? 'Elige algún verbo' : `¡A repasar ${total} ${total === 1 ? 'verbo' : 'verbos'}!`}{' '}
        <Icon name="arrowRight" size={22} strokeWidth={3} />
      </button>
      <p className="fine-print">
        Repasas solo lo que ya has estudiado ({studied.length} de {VERBS.length}).
      </p>
    </main>
  );
}
