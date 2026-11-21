import { MAX_AGE, MIN_AGE } from '../core/profile';

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

export function AgePicker({
  value,
  onChange,
  labelledBy,
}: {
  value: number | null;
  onChange: (age: number) => void;
  labelledBy: string;
}) {
  return (
    <div className="age-picker" role="radiogroup" aria-labelledby={labelledBy}>
      {AGES.map((age) => (
        <button
          key={age}
          type="button"
          role="radio"
          aria-checked={value === age}
          className={`age-option ${value === age ? 'is-selected' : ''}`}
          onClick={() => onChange(age)}
        >
          {age === MAX_AGE ? `${age}+` : age}
        </button>
      ))}
    </div>
  );
}
