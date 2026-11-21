import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Stars } from '../components/Stars';
import { StudySheet } from '../components/StudySheet';
import { profileForAge } from '../core/profile';
import { starsFor } from '../core/quiz';
import { canSpeak, speakAll, stopSpeaking } from '../lib/speech';
import { blockSpeech } from '../lib/text';
import type { UnitScreenProps } from './types';

/** Ficha de estudio de un tema, con lectura en voz alta y botón para practicarlo. */
export function TopicScreen({ unit, progress, settings, go, back, at, updateUnit, topicId }: UnitScreenProps & { topicId: string }) {
  const index = unit.topics.findIndex((t) => t.id === topicId);
  const topic = unit.topics[index];
  const blocks = unit.study[topicId] ?? [];
  const next = unit.topics[index + 1];
  const [reading, setReading] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [gaps, setGaps] = useState(false);
  const hasMap = blocks.some((b) => b.type === 'tree');
  const stopRef = useRef<() => void>(() => {});
  const sheet = useRef<HTMLDivElement>(null);
  const best = progress.best[topicId];
  const count = Math.min(profileForAge(settings.age).quizLength, unit.questions.filter((q) => q.topic === topicId).length);

  const segments = useMemo(
    () => blocks.flatMap((block, i) => blockSpeech(block).map((text) => ({ block: i, text }))),
    [blocks],
  );

  // Abrir la ficha cuenta como "tema empezado" (sus preguntas salen antes en el reto).
  useEffect(() => {
    if (topic && !progress.read.includes(topic.id)) {
      updateUnit((u) => (u.read.includes(topicId) ? u : { ...u, read: [...u.read, topicId] }));
    }
  }, [topic, topicId, progress.read, updateUnit]);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (reading === null) return;
    sheet.current?.querySelector(`[data-block="${reading}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [reading]);

  if (!topic) {
    return (
      <main className="screen">
        <p>Este tema no existe.</p>
        <button type="button" className="btn btn-secondary" onClick={back}>
          Volver
        </button>
      </main>
    );
  }

  function toggleReading() {
    if (speaking) {
      stopRef.current();
      setSpeaking(false);
      setReading(null);
      return;
    }
    setSpeaking(true);
    stopRef.current = speakAll(
      segments.map((s) => s.text),
      {
        lang: unit.lang,
        onIndex: (i) => setReading(segments[i]?.block ?? null),
        onEnd: () => {
          setSpeaking(false);
          setReading(null);
        },
      },
    );
  }

  return (
    <main className="screen topic-screen">
      <header className="topbar">
        <button type="button" className="icon-btn" onClick={back} aria-label="Volver">
          <Icon name="back" strokeWidth={3} />
        </button>
        <span className="topbar-title muted small">
          Tema {index + 1} de {unit.topics.length}
        </span>
        {canSpeak ? (
          <button type="button" className={`listen-btn ${speaking ? 'is-on' : ''}`} onClick={toggleReading} aria-pressed={speaking}>
            <Icon name={speaking ? 'stop' : 'speaker'} size={20} strokeWidth={2.4} />
            {speaking ? 'Parar' : 'Escuchar'}
          </button>
        ) : (
          <span className="topbar-spacer" />
        )}
      </header>

      <section className="topic-hero">
        <span className="topic-hero-emoji" aria-hidden="true">
          {topic.emoji}
        </span>
        <h1 className="title" lang="en">
          {topic.title}
        </h1>
        <p className="muted">{topic.subtitle}</p>
        {best !== undefined && (
          <p className="topic-hero-best">
            <Stars count={starsFor(best)} size={20} /> Tu mejor nota: {best} %
          </p>
        )}
      </section>

      {hasMap && (
        <div className="gap-toggle" role="group" aria-label="Cómo ver el mapa">
          <button type="button" className={`filter-chip ${!gaps ? 'is-selected' : ''}`} aria-pressed={!gaps} onClick={() => setGaps(false)}>
            Ver el mapa
          </button>
          <button
            type="button"
            className={`filter-chip ${gaps ? 'is-selected' : ''}`}
            aria-pressed={gaps}
            onClick={() => setGaps(true)}
          >
            🎯 Completa los huecos
          </button>
        </div>
      )}

      <div ref={sheet}>
        <StudySheet key={gaps ? 'gaps' : 'map'} blocks={blocks} active={reading} lang={unit.lang} gaps={gaps} />
      </div>

      <div className="topic-actions">
        <button
          type="button"
          className="btn btn-primary btn-block btn-big"
          onClick={() => go({ name: 'session', ...at, request: { kind: 'topic', topicId } })}
        >
          <span lang="en">Practise this topic</span> <Icon name="arrowRight" size={22} strokeWidth={3} />
        </button>
        <p className="muted small mission-foot">{count} preguntas con la explicación de cada respuesta</p>
        {next && (
          <button type="button" className="btn btn-secondary btn-block" onClick={() => go({ name: 'topic', ...at, topic: next.id }, { replace: true })}>
            Siguiente tema: <span lang="en">{next.title}</span>
          </button>
        )}
      </div>
    </main>
  );
}
