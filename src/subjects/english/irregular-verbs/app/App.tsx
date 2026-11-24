import { useCallback, useEffect, useRef, useState } from 'react';
import { Exam } from './screens/Exam';
import { Home } from './screens/Home';
import { MyVerbs } from './screens/MyVerbs';
import { Review } from './screens/Review';
import { Session, type SessionRequest } from './screens/Session';
import { Settings } from './screens/Settings';
import { VerbDetail } from './screens/VerbDetail';
import { Welcome } from './screens/Welcome';
import { emptyProgress, loadProgress, saveProgress, type Progress } from './storage/progress';
import './verbs.css';

/**
 * La app de verbos irregulares (la que se hizo primero, aparte) dentro de
 * Schoolwork. El nombre y la edad vienen de Schoolwork; lo demás (semana,
 * progreso, ajustes) es suyo y se guarda aparte.
 */

/** Pantalla actual. Se guarda en el historial del navegador para que "atrás" funcione. */
type Route =
  | { screen: 'home' }
  | { screen: 'settings' }
  | { screen: 'verbs' }
  | { screen: 'verb'; verbId: number }
  | { screen: 'review' }
  | { screen: 'exam'; id: number }
  | { screen: 'session'; request: SessionRequest; id: number };

const HOME: Route = { screen: 'home' };

/** Estado del historial: `depth` lo usa Schoolwork para saber si hay pantalla anterior. */
interface HistoryState {
  depth?: number;
  route?: Route;
}

const historyState = () => (window.history.state as HistoryState | null) ?? {};

export interface VerbsAppProps {
  name: string;
  age: number | null;
  /** Volver al inicio de Schoolwork. */
  onExit: () => void;
}

export default function VerbsApp({ name, age, onExit }: VerbsAppProps) {
  const [progress, setProgress] = useState<Progress>(() => {
    const loaded = loadProgress();
    return { ...loaded, settings: { ...loaded.settings, name, age } };
  });
  const [saveFailed, setSaveFailed] = useState(false);
  const [route, setRoute] = useState<Route>(() => historyState().route ?? HOME);
  const nextId = useRef(1);

  useEffect(() => {
    setSaveFailed(!saveProgress(progress));
  }, [progress]);

  // El nombre y la edad se cambian en Schoolwork.
  useEffect(() => {
    setProgress((p) => (p.settings.name === name && p.settings.age === age ? p : { ...p, settings: { ...p.settings, name, age } }));
  }, [name, age]);

  // El botón "atrás" del móvil vuelve a la pantalla anterior de la app.
  useEffect(() => {
    const current = historyState();
    if (!current.route) window.history.replaceState({ ...current, route: HOME }, '');
    const onPop = (event: PopStateEvent) => {
      const saved = (event.state as HistoryState | null)?.route;
      // Fuera de los verbos (p. ej., de vuelta al inicio de Schoolwork) no hay nada que hacer aquí.
      if (!saved) return;
      // Una sesión o un examen no se reanudan al volver atrás: se va al inicio.
      setRoute(saved.screen !== 'session' && saved.screen !== 'exam' ? saved : HOME);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((next: Route) => {
    window.history.pushState({ depth: (historyState().depth ?? 0) + 1, route: next } satisfies HistoryState, '');
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  /** Cambia de pantalla sin añadir un paso más al historial (p. ej., una sesión tras otra). */
  const replace = useCallback((next: Route) => {
    window.history.replaceState({ ...historyState(), route: next } satisfies HistoryState, '');
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  const back = useCallback(() => {
    if (historyState().route?.screen === 'home') setRoute(HOME);
    else window.history.back();
  }, []);

  const startSession = useCallback(
    (request: SessionRequest, how: 'go' | 'replace' = 'go') => {
      const next: Route = { screen: 'session', request, id: nextId.current++ };
      if (how === 'go') go(next);
      else replace(next);
    },
    [go, replace],
  );

  const update = useCallback((change: (p: Progress) => Progress) => setProgress(change), []);

  let content;
  if (!progress.settings.onboarded) {
    content = (
      <Welcome
        settings={progress.settings}
        onDone={(changes) => {
          setProgress((p) => ({ ...p, settings: { ...p.settings, ...changes } }));
          window.scrollTo(0, 0);
        }}
        onExit={onExit}
      />
    );
  } else if (route.screen === 'session') {
    content = (
      <Session
        key={route.id}
        request={route.request}
        progress={progress}
        update={update}
        onExit={back}
        onNext={(request) => startSession(request, 'replace')}
      />
    );
  } else if (route.screen === 'settings') {
    content = (
      <Settings
        settings={progress.settings}
        onChange={(settings) => setProgress((p) => ({ ...p, settings }))}
        onReset={() => {
          setProgress((p) => ({ ...emptyProgress(), settings: { ...p.settings } }));
          back();
        }}
        onBack={back}
      />
    );
  } else if (route.screen === 'verbs') {
    content = <MyVerbs progress={progress} onOpen={(verbId) => go({ screen: 'verb', verbId })} onBack={back} />;
  } else if (route.screen === 'verb') {
    content = (
      <VerbDetail
        verbId={route.verbId}
        progress={progress}
        onBack={back}
        onPractice={(verbId, seen) =>
          startSession(seen ? { kind: 'practice', verbIds: [verbId], style: 'questions' } : { kind: 'learn', verbIds: [verbId] })
        }
      />
    );
  } else if (route.screen === 'review') {
    content = (
      <Review
        progress={progress}
        onStart={(verbIds, style) => startSession({ kind: 'practice', verbIds, style })}
        onBack={back}
      />
    );
  } else if (route.screen === 'exam') {
    content = (
      <Exam
        key={route.id}
        progress={progress}
        update={update}
        onBack={back}
        onPracticeMistakes={(verbIds) => startSession({ kind: 'practice', verbIds, style: 'questions' }, 'replace')}
      />
    );
  } else {
    content = (
      <Home
        progress={progress}
        onStart={(mode) => startSession({ kind: mode })}
        onSettings={() => go({ screen: 'settings' })}
        onPractice={(screen) => go(screen === 'exam' ? { screen: 'exam', id: nextId.current++ } : { screen })}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="verbs-app">
      <div className="app">
        {saveFailed && (
          <p className="banner" role="alert">
            Este navegador no deja guardar el progreso (¿modo privado?). Puedes practicar, pero se perderá al cerrar.
          </p>
        )}
        {content}
      </div>
    </div>
  );
}
