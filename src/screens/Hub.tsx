import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { profileForAge } from '../core/profile';
import { planDaily } from '../core/session';
import { dayNumber } from '../core/srs';
import { currentStreak, unitSummary } from '../core/stats';
import { plural } from '../lib/text';
import { unitKey, unitOf, type Store } from '../storage/store';
import { allStudyDays, SUBJECTS } from '../subjects';
import { isCustom } from '../subjects/types';

interface Props {
  store: Store;
  onOpen: (subjectId: string, unitId: string) => void;
  onSettings: () => void;
}

/** Inicio: las asignaturas y, dentro de cada una, sus unidades. */
export function Hub({ store, onOpen, onSettings }: Props) {
  const { settings } = store;
  const today = dayNumber();
  // La racha es común: cuenta también los días de las unidades con app propia (los verbos).
  const streak = currentStreak(allStudyDays(store), today);
  const profile = profileForAge(settings.age);

  return (
    <main className="screen hub">
      <header className="home-head">
        <span className="avatar" aria-hidden="true">
          {settings.name.charAt(0).toUpperCase()}
        </span>
        <h1 className="title">¡Hola, {settings.name}!</h1>
        <button type="button" className="icon-btn" onClick={onSettings} aria-label="Ajustes">
          <Icon name="settings" strokeWidth={2.2} />
        </button>
      </header>

      <div className="pills">
        <span className="pill pill-flame">
          <Icon name="flame" size={20} color="var(--flame)" />
          {streak > 0 ? plural(streak, 'día seguido', 'días seguidos') : 'Empieza tu racha'}
        </span>
      </div>

      <p className="hub-lead">¿Qué estudiamos hoy?</p>

      {SUBJECTS.map((subject) => (
        <section key={subject.id} className={`subject subject-${subject.theme}`} aria-labelledby={`subject-${subject.id}`}>
          <div className="subject-head">
            <span className="subject-mascot">
              <Mascot mascot={subject.mascot} size={64} />
            </span>
            <div>
              <h2 id={`subject-${subject.id}`} className="section-title" lang={subject.units[0]?.lang}>
                {subject.name}
              </h2>
              <p className="muted small">
                {subject.nameEs} · con {subject.mascot.name}, {subject.mascot.species}
              </p>
            </div>
          </div>

          <ul className="unit-list">
            {subject.units.map((unit) => {
              let percent: number;
              let pending: number | null;
              let detail: string;
              let word: [string, string] = ['pregunta', 'preguntas'];
              if (isCustom(unit)) {
                ({ percent, pending, detail, pendingWord: word } = unit.summary(settings.age));
              } else {
                const progress = unitOf(store, unitKey(subject.id, unit.id));
                const summary = unitSummary(unit, progress.cards, progress.best);
                const plan = planDaily(unit, progress.cards, today, profile, progress.read);
                percent = summary.percent;
                pending = plan.reviewCount + plan.newCount;
                detail = `${summary.topicsDone} de ${unit.topics.length} temas`;
              }
              return (
                <li key={unit.id}>
                  <button type="button" className="unit-card" onClick={() => onOpen(subject.id, unit.id)}>
                    <span className="unit-card-top">
                      <span className="unit-label" lang={unit.lang}>
                        {unit.label}
                      </span>
                      {pending === null ? (
                        <span className="unit-pending">¡Empieza!</span>
                      ) : pending > 0 ? (
                        <span className="unit-pending">Reto de hoy: {plural(pending, word[0], word[1])}</span>
                      ) : (
                        <span className="unit-pending is-done">
                          <Icon name="check" size={14} strokeWidth={3.5} /> Reto cumplido
                        </span>
                      )}
                    </span>
                    <span className="unit-title" lang={unit.lang}>
                      {unit.title}
                    </span>
                    <span className="unit-subtitle">{unit.subtitle}</span>
                    <span className="meter" aria-hidden="true">
                      <span style={{ width: `${Math.max(percent, 2)}%` }} />
                    </span>
                    <span className="unit-foot">
                      <span>{percent} % aprendido</span>
                      <span>{detail}</span>
                      <Icon name="arrowRight" size={20} strokeWidth={3} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="fine-print">Aquí irán apareciendo más asignaturas y unidades.</p>
    </main>
  );
}
