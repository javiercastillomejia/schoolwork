import type { MascotMood } from './types';

/**
 * Lola, la foca de Matemáticas. Lleva en equilibrio una pelota partida en
 * cuatro cuartos de colores, como una fracción. Cada acierto a la primera le
 * da un pez.
 */
const FUR = '#8EA9C1';
const FUR_DARK = '#6F8CA6';
const BELLY = '#E4EEF6';
const MUZZLE = '#F4F8FB';
const INK = '#1F2A44';
const NOSE = '#2E3550';
const CHEEK = '#FF9AAE';
const ICE = '#D6F0FA';
const ICE_EDGE = '#A9DCEF';
const BALL = ['#FF6B6B', '#FFC531', '#4DABF7', '#51CF66'];

function ballSector(i: number, cx: number, cy: number, r: number): string {
  const a0 = (i / 4) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / 4) * Math.PI * 2 - Math.PI / 2;
  const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${cx} ${cy} L ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)} Z`;
}

export function Seal({ mood = 'normal', size = 120 }: { mood?: MascotMood; size?: number }) {
  const happy = mood === 'happy' || mood === 'party';
  const tilt = mood === 'party' ? 'rotate(18 80 15)' : mood === 'oops' ? 'translate(10 2) rotate(-14 80 15)' : undefined;
  return (
    <svg className="mascot" width={size} height={(size * 15) / 16} viewBox="0 0 160 150" aria-hidden="true">
      {mood === 'party' && (
        <>
          <path d="M18 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFB800" />
          <path d="M142 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FF8FB1" />
          <circle cx="146" cy="70" r="3.5" fill="#FFB800" />
          <circle cx="14" cy="76" r="3" fill="#4DABF7" />
        </>
      )}

      {/* Bloque de hielo */}
      <rect x="14" y="128" width="132" height="18" rx="9" fill={ICE} stroke={ICE_EDGE} strokeWidth="3" />

      {/* Aletas de atrás */}
      <ellipse cx="60" cy="132" rx="15" ry="7" fill={FUR_DARK} transform="rotate(-12 60 132)" />
      <ellipse cx="100" cy="132" rx="15" ry="7" fill={FUR_DARK} transform="rotate(12 100 132)" />

      {/* Cuerpo */}
      <ellipse cx="80" cy="104" rx="36" ry="30" fill={FUR} />
      <ellipse cx="80" cy="110" rx="22" ry="21" fill={BELLY} />

      {/* Aletas de delante */}
      <ellipse cx="46" cy="112" rx="8" ry="16" fill={FUR_DARK} transform="rotate(28 46 112)" />
      <ellipse cx="114" cy="112" rx="8" ry="16" fill={FUR_DARK} transform="rotate(-28 114 112)" />

      {/* Cabeza */}
      <circle cx="80" cy="58" r="35" fill={FUR} />

      {/* Pelota de cuartos */}
      <g transform={tilt}>
        {BALL.map((color, i) => (
          <path key={color} d={ballSector(i, 80, 15, 13)} fill={color} />
        ))}
        <circle cx="80" cy="15" r="13" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="75" cy="10" r="3" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Ojos */}
      {happy ? (
        <>
          <path d="M57 54 Q64 46 71 54" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M89 54 Q96 46 103 54" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="64" cy="52" r="7.5" fill={INK} />
          <circle cx="96" cy="52" r="7.5" fill={INK} />
          <circle cx="66.5" cy="49.5" r="2.6" fill="#FFFFFF" />
          <circle cx="98.5" cy="49.5" r="2.6" fill="#FFFFFF" />
        </>
      )}
      {mood === 'oops' && (
        <>
          <path d="M55 42 L70 38" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M105 42 L90 38" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M116 60 C 112 68, 120 72, 122 66 C 123 63, 120 62, 116 60Z" fill="#7CC8F2" />
        </>
      )}

      {/* Mofletes */}
      <circle cx="52" cy="68" r="6.5" fill={CHEEK} opacity="0.7" />
      <circle cx="108" cy="68" r="6.5" fill={CHEEK} opacity="0.7" />

      {/* Hocico, bigotes y nariz */}
      <ellipse cx="72" cy="72" rx="11" ry="9" fill={MUZZLE} />
      <ellipse cx="88" cy="72" rx="11" ry="9" fill={MUZZLE} />
      <g stroke={FUR_DARK} strokeWidth="1.8" strokeLinecap="round">
        <path d="M62 70 L44 66" />
        <path d="M62 75 L44 77" />
        <path d="M98 70 L116 66" />
        <path d="M98 75 L116 77" />
      </g>
      <circle cx="68" cy="73" r="1.3" fill={FUR_DARK} />
      <circle cx="73" cy="76" r="1.3" fill={FUR_DARK} />
      <circle cx="87" cy="76" r="1.3" fill={FUR_DARK} />
      <circle cx="92" cy="73" r="1.3" fill={FUR_DARK} />
      <ellipse cx="80" cy="65" rx="6.5" ry="4.8" fill={NOSE} />

      {/* Boca */}
      {mood === 'oops' ? (
        <ellipse cx="80" cy="84" rx="3.5" ry="4" fill={INK} />
      ) : happy ? (
        <path d="M72 80 Q80 92 88 80 Z" fill={INK} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      ) : (
        <path d="M74 81 Q77 85 80 82 Q83 85 86 81" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
