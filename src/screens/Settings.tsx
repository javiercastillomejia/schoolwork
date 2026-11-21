import { useState } from 'react';
import { AgePicker } from '../components/AgePicker';
import { Icon } from '../components/Icon';
import { canSpeak } from '../lib/speech';
import { cleanName, unitKey, type Settings as SettingsData, type Store } from '../storage/store';
import { SUBJECTS } from '../subjects';

interface Props {
  store: Store;
  onChange: (settings: SettingsData) => void;
  onResetUnit: (key: string) => void;
  onResetAll: () => void;
  onBack: () => void;
}

export function Settings({ store, onChange, onResetUnit, onResetAll, onBack }: Props) {
  const { settings } = store;
  const [name, setName] = useState(settings.name);
  const [confirm, setConfirm] = useState<string | null>(null);

  function saveName() {
    const clean = cleanName(name);
    if (clean) onChange({ ...settings, name: clean });
    else setName(settings.name);
  }

  const units = SUBJECTS.flatMap((subject) =>
    subject.units.map((unit) => ({ key: unitKey(subject.id, unit.id), label: `${subject.name} · ${unit.label}`, title: unit.title })),
  );

  return (
    <main className="screen settings">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Volver">
          <Icon name="back" strokeWidth={3} />
        </button>
        <h1 className="title topbar-title">Ajustes</h1>
      </header>

      <section className="card">
        <div className="field">
          <label className="field-label" htmlFor="settings-name">
            Nombre
          </label>
          <input
            id="settings-name"
            className="text-input"
            value={name}
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            onBlur={saveName}
            onKeyDown={(event) => event.key === 'Enter' && (event.target as HTMLInputElement).blur()}
          />
        </div>
        <div className="field">
          <span className="field-label" id="settings-age">
            Edad
          </span>
          <AgePicker value={settings.age} onChange={(age) => onChange({ ...settings, age })} labelledBy="settings-age" />
          <p className="muted small">
            Con la edad cambia cuántas preguntas nuevas salen cada día, cuántas opciones hay y si hay pistas.
          </p>
        </div>
      </section>

      {canSpeak && (
        <section className="card">
          <label className="toggle">
            <span>
              <strong>Leer en voz alta</strong>
              <span className="muted small">Cada pregunta y cada ficha se leen solas al salir.</span>
            </span>
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(event) => onChange({ ...settings, autoSpeak: event.target.checked })}
            />
          </label>
        </section>
      )}

      <section className="card">
        <h2 className="section-title">Empezar de cero</h2>
        <p className="muted small">Borra el progreso guardado en este dispositivo. No se puede deshacer.</p>
        {units.map((unit) => (
          <div key={unit.key} className="reset-row">
            <span>
              <strong lang="en">{unit.label}</strong>
              <span className="muted small" lang="en">
                {' '}
                {unit.title}
              </span>
            </span>
            {confirm === unit.key ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onResetUnit(unit.key);
                  setConfirm(null);
                }}
              >
                ¿Seguro? Borrar
              </button>
            ) : (
              <button type="button" className="btn btn-danger-soft" onClick={() => setConfirm(unit.key)}>
                Borrar progreso
              </button>
            )}
          </div>
        ))}
        {confirm === 'all' ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onResetAll();
              setConfirm(null);
            }}
          >
            ¿Seguro? Borrar todo (menos el nombre)
          </button>
        ) : (
          <button type="button" className="btn btn-danger-soft" onClick={() => setConfirm('all')}>
            Borrar todo el progreso
          </button>
        )}
      </section>
    </main>
  );
}
