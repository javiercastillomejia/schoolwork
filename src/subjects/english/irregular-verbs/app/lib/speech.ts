/**
 * Pronunciación con la voz del propio navegador (Web Speech API).
 * Se prefiere inglés británico; si no hay, cualquier voz en inglés.
 */

const synth: SpeechSynthesis | null =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

let voice: SpeechSynthesisVoice | null = null;

function chooseVoice(): void {
  if (!synth) return;
  const voices = synth.getVoices();
  voice =
    voices.find((v) => v.lang === 'en-GB' && v.localService) ??
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang.replace('_', '-').startsWith('en-GB')) ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
}

if (synth) {
  chooseVoice();
  synth.addEventListener?.('voiceschanged', chooseVoice);
}

export const canSpeak = synth !== null;

export function speak(text: string): void {
  if (!synth) return;
  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? 'en-GB';
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    synth.speak(utterance);
  } catch {
    // Sin voz disponible: la app funciona igual sin audio.
  }
}
