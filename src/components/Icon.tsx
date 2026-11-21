const STROKE = {
  speaker: 'M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7M18.4 5.6a9 9 0 0 1 0 12.8',
  stop: 'M7 7h10v10H7z',
  close: 'M6 6l12 12M18 6 6 18',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
  check: 'M5 12.5 9.5 17 19 7',
  back: 'M15 5 8 12l7 7',
  forward: 'M9 5l7 7-7 7',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6',
  book: 'M4 19.5V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2.5ZM4 19.5A2 2 0 0 0 6 21h14M8 7h8M8 11h6',
  cards: 'M7 4h11a2 2 0 0 1 2 2v11M4 8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z',
  exam: 'M9 4h6v3H9zM7 5.5H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5a2 2 0 0 0-2-2h-1M8.5 14l2.5 2.5 4.5-5',
  shuffle: 'M4 7h3.5c4 0 5 10 9 10H20M17 14l3 3-3 3M4 17h3.5c1.3 0 2.2-1 3-2.3M13.5 9.3c.8-1.3 1.7-2.3 3-2.3H20M17 4l3 3-3 3',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z',
  flip: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  retry: 'M4 4v6h6M4.5 10A8 8 0 1 1 6 16.5',
  home: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
} as const;

const FILLED = {
  star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z',
  flame: 'M12 2c1 3.5 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.2 1-3.8 2.2-4.9 0 1.6.6 2.7 1.6 3.3C10.3 7.6 10.9 4.6 12 2Z',
  sparkle: 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z',
  leaf: 'M20 4C10 4 4 9 4 16c0 1.4.3 2.7.8 4 .6-3.8 3.6-7.8 8.2-9.5-3.5 2.5-5.8 5.6-6.6 9.3 1.3.6 2.8 1 4.3 1C17.3 20.8 20 13 20 4Z',
} as const;

export type IconName = keyof typeof STROKE | keyof typeof FILLED;

interface Props {
  name: IconName;
  size?: number;
  /** Color de relleno de los iconos macizos (estrella, llama, hoja…). */
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2.6 }: Props) {
  if (name in FILLED) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d={FILLED[name as keyof typeof FILLED]} fill={color} />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={STROKE[name as keyof typeof STROKE]} />
    </svg>
  );
}
