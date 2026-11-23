import { useState } from 'react';
import { parseRich, plain, type Segment } from '../lib/text';

/** Una fracción con el numerador encima del denominador. */
export function Fraction({ whole, n, d }: { whole?: number | null; n: number | null; d: number | null }) {
  const label = plain(`[${whole !== null && whole !== undefined ? `${whole} ` : ''}${n ?? '?'}/${d ?? '?'}]`, 'es-ES');
  return (
    <span className="frac-wrap" role="img" aria-label={label}>
      {whole !== null && whole !== undefined && <span className="frac-whole">{whole}</span>}
      <span className="frac" aria-hidden="true">
        <span className="frac-n">{n ?? <span className="frac-gap" />}</span>
        <span className="frac-d">{d ?? <span className="frac-gap" />}</span>
      </span>
    </span>
  );
}

function Piece({ segment, gaps }: { segment: Segment; gaps: boolean }) {
  if (segment.kind === 'frac') {
    const fraction = <Fraction whole={segment.whole} n={segment.n} d={segment.d} />;
    return segment.bold ? <mark className="kw">{fraction}</mark> : fraction;
  }
  if (!segment.bold) return <span>{segment.text}</span>;
  if (gaps) return <Gap word={segment.text} />;
  return <mark className="kw">{segment.text}</mark>;
}

/**
 * Texto con las palabras clave resaltadas como con rotulador y las fracciones
 * bien escritas. Con `gaps`, las palabras clave se esconden detrás de un "?"
 * que se destapa al tocarlo (como los huecos del mapa conceptual del libro).
 */
export function Rich({ text, gaps = false }: { text: string; gaps?: boolean }) {
  return (
    <>
      {parseRich(text).map((segment, i) => (
        <Piece key={i} segment={segment} gaps={gaps} />
      ))}
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
