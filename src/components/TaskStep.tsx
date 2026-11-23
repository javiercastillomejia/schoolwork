import { useEffect, useState } from 'react';
import { answerText, checkTask, emptyResponse, isComplete, type Checked, type Response, type Task } from '../core/task';
import type { Topic } from '../core/types';
import { pick } from '../lib/random';
import { speak } from '../lib/speech';
import { plain } from '../lib/text';
import type { MascotInfo } from '../mascots/types';
import { Feedback } from './Feedback';
import { Icon } from './Icon';
import { TaskView } from './TaskView';

interface Props {
  task: Task;
  topic: Topic | undefined;
  hints: boolean;
  name: string;
  mascot: MascotInfo;
  lang: string;
  autoSpeak: boolean;
  retry: boolean;
  /** Guarda la respuesta; devuelve si el ejercicio se repetirá en esta sesión. */
  onAnswer: (correct: boolean, usedHint: boolean) => boolean;
  onContinue: () => void;
}

/** Un ejercicio en práctica: se contesta, se corrige al momento y se explica. */
export function TaskStep({ task, topic, hints, name, mascot, lang, autoSpeak, retry, onAnswer, onContinue }: Props) {
  const [response, setResponse] = useState<Response>(() => emptyResponse(task));
  const [checked, setChecked] = useState<Checked | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);
  const [willRetry, setWillRetry] = useState(false);
  const isChoice = task.body.type === 'choice';

  useEffect(() => {
    if (autoSpeak) speak(plain(task.text, lang), lang);
  }, [task, autoSpeak, lang]);

  function check(current: Response) {
    if (checked) return;
    const result = checkTask(task, current);
    setChecked(result);
    setWillRetry(onAnswer(result.correct, removed !== null));
  }

  function takeHint() {
    if (task.body.type !== 'choice' || removed || checked) return;
    const correct = task.body.correct;
    setRemoved(pick(task.body.options.filter((o) => o !== correct)));
  }

  const complete = isComplete(task, response);
  const canHint = hints && isChoice && task.body.type === 'choice' && task.body.options.length > 2 && !removed && !checked;

  return (
    <>
      <TaskView
        task={task}
        topic={topic}
        lang={lang}
        response={response}
        onChange={setResponse}
        phase={checked ? 'checked' : 'answer'}
        checked={checked ?? undefined}
        removed={removed}
        onChoose={(option) => check({ type: 'choice', value: option })}
        onSubmit={() => complete && check(response)}
      />

      {canHint && (
        <button type="button" className="hint-btn" onClick={takeHint}>
          <Icon name="bulb" size={20} strokeWidth={2.4} /> Pista: quitar una opción
        </button>
      )}
      {retry && !checked && <p className="retry-note">¡Otra vez esta! Ahora sí.</p>}

      {!isChoice && !checked && (
        <button type="button" className="btn btn-primary btn-block btn-big check-btn" disabled={!complete} onClick={() => check(response)}>
          Comprobar <Icon name="check" size={22} strokeWidth={3} />
        </button>
      )}

      {checked && (
        <Feedback
          correct={checked.correct}
          answer={answerText(task)}
          why={task.why}
          name={name}
          mascot={mascot}
          lang={lang}
          earned={checked.correct && !retry && removed === null}
          willRetry={willRetry}
          onContinue={onContinue}
        />
      )}
    </>
  );
}
