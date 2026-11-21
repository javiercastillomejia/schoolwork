import { canSpeak, speak } from '../lib/speech';
import { Icon } from './Icon';

export function SpeakButton({ text, label, lang = 'en-GB' }: { text: string; label: string; lang?: string }) {
  if (!canSpeak) return null;
  return (
    <button
      type="button"
      className="speak"
      onClick={(event) => {
        event.stopPropagation();
        speak(text, lang);
      }}
      aria-label={`Escuchar ${label}`}
    >
      <Icon name="speaker" size={22} strokeWidth={2.4} />
    </button>
  );
}
