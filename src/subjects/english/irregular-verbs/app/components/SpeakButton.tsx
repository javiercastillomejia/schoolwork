import { canSpeak, speak } from '../lib/speech';
import { Icon } from './Icon';

export function SpeakButton({ text, label }: { text: string; label: string }) {
  if (!canSpeak) return null;
  return (
    <button type="button" className="speak" onClick={() => speak(text)} aria-label={`Escuchar ${label}`}>
      <Icon name="speaker" size={22} strokeWidth={2.4} />
    </button>
  );
}
