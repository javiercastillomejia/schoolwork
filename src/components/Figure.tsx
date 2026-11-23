import type { KeyboardEvent } from 'react';
import type { Figure as FigureData, Shape } from '../core/task';

const FILL = 'var(--fig-fill)';
const EMPTY = 'var(--fig-empty)';
const STROKE = 'var(--fig-stroke)';

/** Trozos de un círculo partido en `parts` sectores iguales. */
function sectorPath(i: number, parts: number, r: number, c: number): string {
  if (parts === 1) return `M ${c - r} ${c} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
  const a0 = (i / parts) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / parts) * Math.PI * 2 - Math.PI / 2;
  const x0 = c + r * Math.cos(a0);
  const y0 = c + r * Math.sin(a0);
  const x1 = c + r * Math.cos(a1);
  const y1 = c + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${c} ${c} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

interface ShapeProps {
  shape: Shape;
  parts: number;
  /** Trozos coloreados. */
  filled: boolean[];
  /** Si se puede tocar cada trozo para colorearlo. */
  onToggle?: (index: number) => void;
  label: string;
}

/** Barra, círculo o grupo de figuras; se puede usar para colorear. */
export function ShapeFigure({ shape, parts, filled, onToggle, label }: ShapeProps) {
  const interactive = Boolean(onToggle);
  const pieceProps = (i: number) =>
    interactive
      ? {
          role: 'checkbox' as const,
          'aria-checked': filled[i] ?? false,
          'aria-label': `Trozo ${i + 1}`,
          tabIndex: 0,
          onClick: () => onToggle?.(i),
          onKeyDown: (event: KeyboardEvent) => {
            if (event.key === ' ' || event.key === 'Enter') {
              event.preventDefault();
              onToggle?.(i);
            }
          },
          className: 'piece is-tappable',
        }
      : { className: 'piece' };

  if (shape === 'circle') {
    const size = 150;
    const c = size / 2;
    const r = c - 4;
    return (
      <svg className="figure figure-circle" viewBox={`0 0 ${size} ${size}`} role={interactive ? 'group' : 'img'} aria-label={label}>
        {Array.from({ length: parts }, (_, i) => (
          <path key={i} d={sectorPath(i, parts, r, c)} fill={filled[i] ? FILL : EMPTY} stroke={STROKE} strokeWidth="2.5" {...pieceProps(i)} />
        ))}
      </svg>
    );
  }

  if (shape === 'bar') {
    const cell = Math.min(46, Math.floor(300 / parts));
    const width = cell * parts;
    return (
      <svg className="figure figure-bar" viewBox={`0 0 ${width + 4} 64`} role={interactive ? 'group' : 'img'} aria-label={label} style={{ maxWidth: width + 4 }}>
        {Array.from({ length: parts }, (_, i) => (
          <rect key={i} x={2 + i * cell} y={2} width={cell} height={60} fill={filled[i] ? FILL : EMPTY} stroke={STROKE} strokeWidth="2.5" {...pieceProps(i)} />
        ))}
      </svg>
    );
  }

  // Grupo de bolitas o cuadraditos (p. ej., "rodea [2/5] de 10 círculos").
  const perRow = Math.min(parts, parts > 8 ? Math.ceil(parts / 2) : parts);
  const rows = Math.ceil(parts / perRow);
  const step = 44;
  return (
    <svg
      className="figure figure-group"
      viewBox={`0 0 ${perRow * step} ${rows * step}`}
      role={interactive ? 'group' : 'img'}
      aria-label={label}
      style={{ maxWidth: perRow * step }}
    >
      {Array.from({ length: parts }, (_, i) => {
        const x = (i % perRow) * step + step / 2;
        const y = Math.floor(i / perRow) * step + step / 2;
        const fill = filled[i] ? FILL : 'var(--fig-item)';
        return shape === 'dots' ? (
          <circle key={i} cx={x} cy={y} r={17} fill={fill} stroke={filled[i] ? STROKE : 'var(--fig-item-stroke)'} strokeWidth={filled[i] ? 4 : 2} {...pieceProps(i)} />
        ) : (
          <rect
            key={i}
            x={x - 16}
            y={y - 16}
            width={32}
            height={32}
            rx={4}
            fill={fill}
            stroke={filled[i] ? STROKE : 'var(--fig-item-stroke)'}
            strokeWidth={filled[i] ? 4 : 2}
            {...pieceProps(i)}
          />
        );
      })}
    </svg>
  );
}

/** Recta numérica del 0 al 1 con marcas y puntos con letra. */
function NumberLine({ parts, points }: { parts: number; points: { label: string; at: number }[] }) {
  const x0 = 20;
  const x1 = 320;
  const xAt = (t: number) => x0 + (x1 - x0) * t;
  return (
    <svg className="figure figure-line" viewBox="0 0 340 90" role="img" aria-label={`Recta numérica del 0 al 1 partida en ${parts} trozos`}>
      <line x1={x0 - 10} y1={50} x2={x1 + 10} y2={50} stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      {Array.from({ length: parts + 1 }, (_, i) => (
        <line key={i} x1={xAt(i / parts)} y1={i === 0 || i === parts ? 38 : 42} x2={xAt(i / parts)} y2={i === 0 || i === parts ? 62 : 58} stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      ))}
      <text x={x0} y={84} textAnchor="middle" className="figure-text">
        0
      </text>
      <text x={x1} y={84} textAnchor="middle" className="figure-text">
        1
      </text>
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={xAt(p.at)} cy={50} r={8} fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
          <text x={xAt(p.at)} y={26} textAnchor="middle" className="figure-text figure-point">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Figure({ figure }: { figure: FigureData }) {
  if (figure.kind === 'line') return <NumberLine parts={figure.parts} points={figure.points} />;
  const filled = Array.from({ length: figure.parts }, (_, i) => i < figure.filled);
  return (
    <ShapeFigure
      shape={figure.shape}
      parts={figure.parts}
      filled={filled}
      label={`Figura partida en ${figure.parts} trozos iguales, con ${figure.filled} coloreados`}
    />
  );
}
