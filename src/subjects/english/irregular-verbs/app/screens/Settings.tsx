import { Icon } from '../components/Icon';
import { WeekPicker } from '../components/Pickers';
import { canSpeak, speak } from '../lib/speech';
import type { Settings as SettingsData } from '../storage/progress';

interface Props {
  settings: SettingsData;
  onChange: (settings: SettingsData) => void;
  onReset: () => void;
  onBack: () => void;
}

export function Settings({ settings, onChange, onReset, onBack }: Props) {
  return (
    <main className="screen settings">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Volver">
          <Icon name="back" />
        </button>
        <h1 className="title">Ajustes</h1>
        <span className="topbar-spacer" />
      </header>

      <p className="note">Tu nombre y tu edad se cambian en los ajustes generales de Schoolwork (el engranaje del inicio).</p>

      <section className="card">
        <h2 className="section-title">Semana actual</h2>
        <p className="muted small">Los verbos nuevos salen hasta esta semana; los de antes siguen entrando en los repasos.</p>
        <WeekPicker value={settings.currentWeek} onChange={(week) => onChange({ ...settings, currentWeek: week })} />
      </section>

      {canSpeak && (
        <section className="card">
          <label className="toggle">
            <span>
              <strong>Leer en voz alta</strong>
              <span className="muted small">Pronuncia cada verbo al verlo y al corregir.</span>
            </span>
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(event) => {
                onChange({ ...settings, autoSpeak: event.target.checked });
                if (event.target.checked) speak('to speak. spoke');
              }}
            />
          </label>
        </section>
      )}

      <section className="card">
        <h2 className="section-title">Progreso</h2>
        <p className="muted small">El progreso se guarda en este dispositivo y en este navegador.</p>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm('¿Seguro que quieres borrar todo el progreso? Se pierden los verbos, las estrellas y la racha.'))
              onReset();
          }}
        >
          Borrar todo el progreso
        </button>
      </section>
    </main>
  );
}
