import { useState } from 'react';
import { BacoSays } from '../components/Baco';
import { Icon } from '../components/Icon';
import { WeekPicker } from '../components/Pickers';
import type { Settings } from '../storage/progress';

interface Props {
  settings: Settings;
  onDone: (changes: Partial<Settings>) => void;
  /** Volver al inicio de Schoolwork. */
  onExit: () => void;
}

/** Primera vez en los verbos: el nombre y la edad ya los sabe Schoolwork; falta la semana de clase. */
export function Welcome({ settings, onDone, onExit }: Props) {
  const [week, setWeek] = useState<number | null>(null);

  return (
    <main className="screen welcome">
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Inicio">
          <Icon name="home" />
        </button>
        <span className="topbar-spacer" />
      </div>

      <BacoSays>
        ¡Hola{settings.name ? `, ${settings.name}` : ''}! Soy <strong className="baco-name">Baco</strong>, el camaleón. Cambio de
        color igual que los verbos irregulares cambian de forma. Los verbos nuevos saldrán hasta la semana que elijas.
      </BacoSays>

      <h1 className="title">¿En qué semana vais en clase?</h1>
      <WeekPicker value={week} onChange={setWeek} />

      <button
        type="button"
        className="btn btn-primary btn-block btn-big btn-bottom"
        disabled={week === null}
        onClick={() => week !== null && onDone({ currentWeek: week, onboarded: true })}
      >
        ¡Empezar! <Icon name="arrowRight" size={22} strokeWidth={3} />
      </button>
    </main>
  );
}
