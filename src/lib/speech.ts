/**
 * Lectura en voz alta con la voz del propio navegador (Web Speech API).
 * Para inglés se prefiere británico (en-GB), a 0,9 de velocidad.
 */

const synth: SpeechSynthesis | null =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

let voices: SpeechSynthesisVoice[] = [];

function loadVoices(): void {
  if (synth) voices = synth.getVoices();
}

if (synth) {
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
}

function voiceFor(lang: string): SpeechSynthesisVoice | null {
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-');
  const base = lang.split('-')[0] ?? lang;
  return (
    voices.find((v) => norm(v) === lang && v.localService) ??
    voices.find((v) => norm(v) === lang) ??
    voices.find((v) => norm(v).startsWith(base)) ??
    null
  );
}

export const canSpeak = synth !== null;

let session = 0;

/** Lee varios trozos seguidos. `onIndex` avisa de qué trozo se está leyendo; devuelve cómo pararlo. */
export function speakAll(
  texts: string[],
  { lang = 'en-GB', onIndex, onEnd }: { lang?: string; onIndex?: (index: number) => void; onEnd?: () => void } = {},
): () => void {
  if (!synth || texts.length === 0) {
    onEnd?.();
    return () => {};
  }
  const mine = ++session;
  try {
    synth.cancel();
    const voice = voiceFor(lang);
    texts.forEach((text, index) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang ?? lang;
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.onstart = () => {
        if (session === mine) onIndex?.(index);
      };
      if (index === texts.length - 1) {
        utterance.onend = () => {
          if (session === mine) onEnd?.();
        };
      }
      synth.speak(utterance);
    });
  } catch {
    onEnd?.();
  }
  return () => {
    if (session === mine) {
      session++;
      try {
        synth.cancel();
      } catch {
        // Nada que parar.
      }
    }
  };
}

export function speak(text: string, lang = 'en-GB'): void {
  speakAll([text], { lang });
}

export function stopSpeaking(): void {
  session++;
  try {
    synth?.cancel();
  } catch {
    // Nada que parar.
  }
}
