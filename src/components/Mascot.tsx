import type { ReactNode } from 'react';
import { Koala } from '../mascots/Koala';
import type { MascotInfo, MascotMood } from '../mascots/types';

const ART = { koala: Koala } as const;

export function Mascot({ mascot, mood = 'normal', size = 120 }: { mascot: MascotInfo; mood?: MascotMood; size?: number }) {
  const Art = ART[mascot.art];
  return <Art mood={mood} size={size} />;
}

/** La mascota con un bocadillo al lado. */
export function MascotSays({
  mascot,
  children,
  mood = 'normal',
  size = 104,
}: {
  mascot: MascotInfo;
  children: ReactNode;
  mood?: MascotMood;
  size?: number;
}) {
  return (
    <div className="mascot-says">
      <Mascot mascot={mascot} mood={mood} size={size} />
      <p className="bubble">{children}</p>
    </div>
  );
}
