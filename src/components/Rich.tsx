import { useState } from 'react';
import { parseRich } from '../lib/text';

/**
 * Texto con las palabras clave resaltadas como con rotulador. Con `gaps`, las
 * palabras clave se esconden detrás de un "?" que se destapa al tocarlo
 * (como los huecos del mapa conceptual del libro).
 */
export function Rich({ text, gaps = false }: { text: string; gaps?: boolean }) {
  return (
    <>
      {parseRich(text).map((segment, i) =>
        segment.bold ? (
          gaps ? (
            <Gap key={i} word={segment.text} />
          ) : (
            <mark key={i} className="kw">
              {segment.text}
            </mark>
          )
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function Gap({ word }: { word: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <mark className="kw gap-open">{word}</mark>;
  return (
    <button type="button" className="gap" onClick={() => setOpen(true)} aria-label="Hueco: toca para ver la palabra">
      ?
    </button>
  );
}
