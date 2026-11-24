import type { ReactNode } from 'react';

/**
 * Baco, el camaleón: cambia de color igual que los verbos irregulares cambian
 * de forma. Verde normalmente, naranja cuando es "casi" y de colores al celebrar.
 */
export type BacoMood = 'normal' | 'happy' | 'oops' | 'party';

const PALETTES: Record<BacoMood, { body: string; dark: string; belly: string; crest: string; eye: string; tail: string }> = {
  normal: { body: '#3CC47C', dark: '#24A866', belly: '#B5EDCB', crest: '#24A866', eye: '#24A866', tail: '#24A866' },
  happy: { body: '#3CC47C', dark: '#24A866', belly: '#B5EDCB', crest: '#24A866', eye: '#24A866', tail: '#24A866' },
  oops: { body: '#FFA94D', dark: '#F08A24', belly: '#FFE0BD', crest: '#F08A24', eye: '#F08A24', tail: '#F08A24' },
  party: { body: '#3CC47C', dark: '#24A866', belly: '#FFC531', crest: '#FF8FB1', eye: '#5CC8FF', tail: '#7A5CF7' },
};

export function Baco({ mood = 'normal', size = 120 }: { mood?: BacoMood; size?: number }) {
  const c = PALETTES[mood];
  const celebrating = mood === 'happy' || mood === 'party';
  return (
    <svg className="baco" width={size} height={(size * 3) / 4} viewBox="0 0 160 120" aria-hidden="true">
      {celebrating && (
        <>
          <path d="M14 14 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFB800" />
          <path d="M146 10 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFB800" />
        </>
      )}
      <path d="M10 106 C 50 99, 110 99, 150 106" fill="none" stroke="#B07A4F" strokeWidth="7" strokeLinecap="round" />
      <path
        d="M48 80 C 26 88, 8 76, 12 60 C 16 46, 32 46, 32 57 C 32 64, 23 65, 23 59"
        fill="none"
        stroke={c.tail}
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path d="M40 72 C 40 46, 70 34, 100 38 C 124 41, 140 54, 138 70 C 136 86, 116 92, 92 92 C 64 92, 40 88, 40 72 Z" fill={c.body} />
      <path d="M60 84 C 76 91, 108 91, 124 81" fill="none" stroke={c.belly} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M58 45 L64 37 L70 43 L76 34 L82 41 L88 33 L94 41"
        fill="none"
        stroke={c.crest}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M66 90 L62 102 M104 90 L108 102" fill="none" stroke={c.dark} strokeWidth="9" strokeLinecap="round" />
      <circle cx="118" cy="56" r="15" fill={c.eye} />
      <circle cx="118" cy="56" r="10" fill="#FFFFFF" />
      {mood === 'oops' ? (
        <>
          <circle cx="120" cy="53" r="5" fill="#24204A" />
          <circle cx="122" cy="51" r="1.6" fill="#FFFFFF" />
          <ellipse cx="127" cy="78" rx="3.5" ry="4.5" fill="#24204A" />
          <circle cx="133" cy="70" r="3.5" fill="#FF9AAE" />
        </>
      ) : (
        <>
          <circle cx="121" cy="56" r="5" fill="#24204A" />
          <circle cx="123" cy="54" r="1.6" fill="#FFFFFF" />
          {celebrating ? (
            <path
              d="M116 75 C 122 84, 132 82, 136 72"
              fill="#24204A"
              stroke="#24204A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path d="M118 77 C 124 81, 131 79, 135 73" fill="none" stroke="#24204A" strokeWidth="3" strokeLinecap="round" />
          )}
          <circle cx="130" cy="71" r="3.5" fill="#FF9AAE" />
        </>
      )}
    </svg>
  );
}

/** Baco con un bocadillo al lado. */
export function BacoSays({ children, mood = 'normal', size = 104 }: { children: ReactNode; mood?: BacoMood; size?: number }) {
  return (
    <div className="baco-says">
      <Baco mood={mood} size={size} />
      <p className="bubble">{children}</p>
    </div>
  );
}
