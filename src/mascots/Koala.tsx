import type { MascotMood } from './types';

/**
 * Koa, el koala de Natural Science. Se pasa el día entre hojas de eucalipto:
 * cada acierto a la primera le da una hoja nueva.
 */
const FUR = '#9AA8B6';
const FUR_DARK = '#7C8A99';
const FLUFF = '#EDF1F5';
const EAR_PINK = '#F6C3D2';
const INK = '#24204A';
const NOSE = '#3A3F4D';
const CHEEK = '#FF9AAE';
const LEAF = '#5DB86B';
const LEAF_DARK = '#3E9A50';
const BRANCH = '#A9764A';

export function Koala({ mood = 'normal', size = 120 }: { mood?: MascotMood; size?: number }) {
  const happy = mood === 'happy' || mood === 'party';
  return (
    <svg className="mascot" width={size} height={(size * 15) / 16} viewBox="0 0 160 150" aria-hidden="true">
      {mood === 'party' && (
        <>
          <path d="M14 20 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFB800" />
          <path d="M146 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FF8FB1" />
          <circle cx="150" cy="58" r="3.5" fill="#FFB800" />
          <circle cx="10" cy="66" r="3" fill="#5CC8FF" />
        </>
      )}

      {/* Rama de eucalipto */}
      <path d="M4 136 C 50 128, 110 128, 156 136" fill="none" stroke={BRANCH} strokeWidth="7" strokeLinecap="round" />
      <path d="M140 132 C 150 120, 158 122, 156 112 C 146 112, 140 120, 140 132Z" fill={LEAF} />
      <path d="M18 132 C 6 124, 2 128, 2 118 C 12 116, 18 124, 18 132Z" fill={LEAF_DARK} />

      {/* Cuerpo */}
      <ellipse cx="80" cy="110" rx="42" ry="30" fill={FUR} />
      <ellipse cx="80" cy="116" rx="25" ry="19" fill={FLUFF} />
      <ellipse cx="52" cy="131" rx="13" ry="8" fill={FUR_DARK} />
      <ellipse cx="108" cy="131" rx="13" ry="8" fill={FUR_DARK} />

      {/* Orejas */}
      <circle cx="35" cy="44" r="27" fill={FUR} />
      <circle cx="125" cy="44" r="27" fill={FUR} />
      <circle cx="37" cy="46" r="18" fill={FLUFF} />
      <circle cx="123" cy="46" r="18" fill={FLUFF} />
      <circle cx="39" cy="48" r="9" fill={EAR_PINK} />
      <circle cx="121" cy="48" r="9" fill={EAR_PINK} />

      {/* Cabeza */}
      <ellipse cx="80" cy="66" rx="47" ry="42" fill={FUR} />
      <ellipse cx="80" cy="92" rx="22" ry="12" fill={FLUFF} opacity="0.55" />

      {/* Ojos */}
      {happy ? (
        <>
          <path d="M53 63 Q60 55 67 63" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M93 63 Q100 55 107 63" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="60" cy="61" r="6" fill={INK} />
          <circle cx="100" cy="61" r="6" fill={INK} />
          <circle cx="62" cy="59" r="2" fill="#FFFFFF" />
          <circle cx="102" cy="59" r="2" fill="#FFFFFF" />
        </>
      )}
      {mood === 'oops' && (
        <>
          <path d="M51 52 L66 47" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M109 52 L94 47" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M132 70 C 128 78, 136 82, 138 76 C 139 73, 136 72, 132 70Z" fill="#7CC8F2" />
        </>
      )}

      {/* Mofletes */}
      <circle cx="48" cy="80" r="7" fill={CHEEK} opacity="0.75" />
      <circle cx="112" cy="80" r="7" fill={CHEEK} opacity="0.75" />

      {/* Nariz */}
      <ellipse cx="80" cy="76" rx="13" ry="16" fill={NOSE} />
      <ellipse cx="75" cy="69" rx="3.5" ry="5.5" fill="#FFFFFF" opacity="0.35" />

      {/* Boca */}
      {mood === 'oops' ? (
        <ellipse cx="80" cy="99" rx="4.5" ry="5" fill={INK} />
      ) : happy ? (
        <path d="M70 95 Q80 108 90 95 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      ) : (
        <path d="M72 96 Q80 102 88 96" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      )}

      {/* Hoja en la mano al celebrar */}
      {mood === 'party' && (
        <g transform="rotate(28 120 124)">
          <path d="M120 126 L120 96" stroke={BRANCH} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M120 98 C 108 88, 112 74, 120 68 C 128 74, 132 88, 120 98Z" fill={LEAF} />
          <path d="M120 96 L120 76" stroke={LEAF_DARK} strokeWidth="1.5" />
          <ellipse cx="120" cy="124" rx="9" ry="7" fill={FUR_DARK} />
        </g>
      )}
    </svg>
  );
}
