import type { Verb } from '../data/verbs';
import { meaningOptions } from '../engine/meanings';

/** Los significados de la hoja, cada uno por separado: vale cualquiera. */
export function MeaningChips({ verb, label = true }: { verb: Verb; label?: boolean }) {
  const options = meaningOptions(verb);
  return (
    <div className="meanings">
      {label && (
        <span className="form-label">{options.length > 1 ? 'Significados · vale cualquiera' : 'Significado'}</span>
      )}
      <div className="meaning-chips">
        {options.map((option) => (
          <span key={option} className="meaning-chip">
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
