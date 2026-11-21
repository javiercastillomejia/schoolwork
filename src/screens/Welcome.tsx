import { useState, type FormEvent } from 'react';
import { AgePicker } from '../components/AgePicker';
import { Icon } from '../components/Icon';
import { MascotSays } from '../components/Mascot';
import type { MascotInfo } from '../mascots/types';
import { cleanName, type Settings } from '../storage/store';

interface Props {
  settings: Settings;
  mascot: MascotInfo;
  onDone: (changes: Partial<Settings>) => void;
}

/** Primera vez: nombre y edad (sirven para todas las asignaturas). */
export function Welcome({ settings, mascot, onDone }: Props) {
  const [name, setName] = useState(settings.name);
  const [age, setAge] = useState<number | null>(settings.age);
  const clean = cleanName(name);
  const ready = clean !== '' && age !== null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (ready) onDone({ name: clean, age });
  }

  return (
    <main className="screen welcome">
      <MascotSays mascot={mascot} size={112}>
        ¡Hola! Soy <strong className="mascot-name">{mascot.name}</strong>, {mascot.species}. {mascot.intro}
      </MascotSays>

      <header className="welcome-head">
        <h1 className="title">Cuéntame un poco de ti</h1>
        <p className="muted">Así podré llamarte por tu nombre y ponerte retos a tu medida.</p>
      </header>

      <form className="welcome-form" onSubmit={submit}>
        <div className="field">
          <label className="field-label" htmlFor="name">
            ¿Cómo te llamas?
          </label>
          <input
            id="name"
            className="text-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Escribe tu nombre"
            autoComplete="given-name"
            autoCapitalize="words"
            maxLength={24}
            enterKeyHint="next"
          />
        </div>

        <div className="field">
          <span className="field-label" id="age-label">
            ¿Cuántos años tienes?
          </span>
          <AgePicker value={age} onChange={setAge} labelledBy="age-label" />
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-big btn-bottom" disabled={!ready}>
          {clean ? `¡Vamos, ${clean}!` : '¡Vamos!'} <Icon name="arrowRight" size={22} strokeWidth={3} />
        </button>
        <p className="fine-print">Tu nombre y tu edad solo se guardan en este dispositivo.</p>
      </form>
    </main>
  );
}
