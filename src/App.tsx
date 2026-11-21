import { useCallback, useEffect, useState } from 'react';
import { stopSpeaking } from './lib/speech';
import { parentOf, parseHash, toHash, type Route } from './lib/router';
import { Cards } from './screens/Cards';
import { Exam } from './screens/Exam';
import { Hub } from './screens/Hub';
import { Session } from './screens/Session';
import { Settings } from './screens/Settings';
import { TopicScreen } from './screens/TopicScreen';
import type { UnitScreenProps } from './screens/types';
import { UnitHome } from './screens/UnitHome';
import { Welcome } from './screens/Welcome';
import { emptyStore, loadStore, needsProfile, saveStore, unitKey, unitOf, updateUnit, type Store } from './storage/store';
import { findUnit, SUBJECTS } from './subjects';

interface HistoryState {
  /** Pantallas de la app que hay detrás de esta en el historial. */
  depth: number;
}

const depthNow = () => (window.history.state as HistoryState | null)?.depth ?? 0;

export default function App() {
  const [store, setStore] = useState<Store>(loadStore);
  const [saveFailed, setSaveFailed] = useState(false);
  const [{ route, visit }, setNav] = useState(() => ({ route: parseHash(window.location.hash), visit: 0 }));

  useEffect(() => {
    setSaveFailed(!saveStore(store));
  }, [store]);

  // El botón "atrás" del móvil (o del navegador) vuelve a la pantalla anterior de la app.
  useEffect(() => {
    if (window.history.state === null) window.history.replaceState({ depth: 0 } satisfies HistoryState, '');
    const onPop = () => {
      stopSpeaking();
      setNav((n) => ({ route: parseHash(window.location.hash), visit: n.visit + 1 }));
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((next: Route, { replace = false }: { replace?: boolean } = {}) => {
    stopSpeaking();
    const state: HistoryState = { depth: replace ? depthNow() : depthNow() + 1 };
    if (replace) window.history.replaceState(state, '', toHash(next));
    else window.history.pushState(state, '', toHash(next));
    setNav((n) => ({ route: next, visit: n.visit + 1 }));
    window.scrollTo(0, 0);
  }, []);

  const back = useCallback(() => {
    if (depthNow() > 0) window.history.back();
    else go(parentOf(route), { replace: true });
  }, [go, route]);

  const update = useCallback((change: (s: Store) => Store) => setStore(change), []);

  const { settings } = store;
  let content;

  if (needsProfile(settings)) {
    content = (
      <Welcome
        settings={settings}
        mascot={SUBJECTS[0]!.mascot}
        onDone={(changes) => {
          setStore((s) => ({ ...s, settings: { ...s.settings, ...changes } }));
          window.scrollTo(0, 0);
        }}
      />
    );
  } else if (route.name === 'hub') {
    content = <Hub store={store} onOpen={(subject, unit) => go({ name: 'unit', subject, unit })} onSettings={() => go({ name: 'settings' })} />;
  } else if (route.name === 'settings') {
    content = (
      <Settings
        store={store}
        onChange={(next) => setStore((s) => ({ ...s, settings: next }))}
        onResetUnit={(key) => setStore((s) => ({ ...s, units: { ...s.units, [key]: undefined } }))}
        onResetAll={() => setStore((s) => ({ ...emptyStore(), settings: s.settings }))}
        onBack={back}
      />
    );
  } else {
    const found = findUnit(route.subject, route.unit);
    if (!found) {
      content = <Hub store={store} onOpen={(subject, unit) => go({ name: 'unit', subject, unit })} onSettings={() => go({ name: 'settings' })} />;
    } else {
      const key = unitKey(found.subject.id, found.unit.id);
      const props: UnitScreenProps = {
        subject: found.subject,
        unit: found.unit,
        progress: unitOf(store, key),
        settings,
        studyDays: store.studyDays,
        update,
        updateUnit: (change) => setStore((s) => updateUnit(s, key, change)),
        go,
        back,
        at: { subject: found.subject.id, unit: found.unit.id },
      };
      if (route.name === 'unit') content = <UnitHome {...props} />;
      else if (route.name === 'topic') content = <TopicScreen key={route.topic} {...props} topicId={route.topic} />;
      else if (route.name === 'session') content = <Session key={visit} {...props} request={route.request} />;
      else if (route.name === 'exam') content = <Exam key={visit} {...props} />;
      else content = <Cards key={visit} {...props} />;
    }
  }

  const theme =
    needsProfile(settings) || route.name === 'hub' || route.name === 'settings'
      ? 'home'
      : (findUnit(route.subject, route.unit)?.subject.theme ?? 'home');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      {saveFailed && (
        <p className="banner" role="alert">
          Este navegador no deja guardar el progreso (¿modo privado?). Puedes estudiar, pero se perderá al cerrar.
        </p>
      )}
      {content}
    </div>
  );
}
