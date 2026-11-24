import { WEEKS } from '../data/verbs';
import type { Cards } from '../engine/session';
import { pathReach, weekNodeState, weekProgress, type WeekNodeState, type WeekProgress } from '../engine/stats';

/** Centros de los 11 nodos: un camino en zigzag de 4 + 4 + 3. */
const CENTERS: [number, number][] = [
  [43, 34], [128, 34], [214, 34], [299, 34],
  [299, 114], [214, 114], [128, 114], [43, 114],
  [43, 194], [128, 194], [214, 194],
];

const STAR = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z';
const TROPHY = 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6';

/** Trazo que pasa por los primeros `count` nodos, con curvas en los giros. */
function pathThrough(count: number): string {
  const points = CENTERS.slice(0, Math.max(1, count));
  let d = `M${points[0]![0]} ${points[0]![1]}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1]!;
    const [x, y] = points[i]!;
    if (py === y) d += ` H${x}`;
    else {
      const bulge = x > 171 ? 37 : -37;
      d += ` C ${px + bulge} ${py}, ${x + bulge} ${y}, ${x} ${y}`;
    }
  }
  return d;
}

function describe(progress: WeekProgress, state: WeekNodeState): string {
  if (state === 'done') return `Semana ${progress.week}: completa, ${progress.stars} de 3 estrellas`;
  if (state === 'locked' || state === 'goal') return `Semana ${progress.week}: todavía no`;
  return `Semana ${progress.week}: ${progress.learned} de ${progress.total} verbos`;
}

export function WeekPath({ cards, currentWeek }: { cards: Cards; currentWeek: number }) {
  const weeks = WEEKS.map((week) => {
    const progress = weekProgress(cards, week);
    return { progress, state: weekNodeState(progress, currentWeek) };
  });
  const label = weeks.map(({ progress, state }) => describe(progress, state)).join('. ');

  return (
    <svg className="week-path" viewBox="0 0 342 246" role="img" aria-label={label}>
      <path className="week-path-trail" d={pathThrough(CENTERS.length)} />
      <path className="week-path-done" d={pathThrough(Math.min(pathReach(cards, currentWeek), CENTERS.length))} />
      {weeks.map(({ progress, state }, i) => {
        const [cx, cy] = CENTERS[i]!;
        const big = state === 'current';
        const r = big ? 32 : 28;
        return (
          <g key={progress.week} className={`node node-${state}`}>
            {big && <circle className="node-ring" cx={cx} cy={cy} r={r + 6} />}
            <circle className="node-shadow" cx={cx} cy={cy + 4} r={r} />
            <circle className="node-face" cx={cx} cy={cy} r={r} />
            {state === 'goal' ? (
              <path
                className="node-trophy"
                d={TROPHY}
                transform={`translate(${cx - 14} ${cy - 14}) scale(1.17)`}
              />
            ) : (
              <text className="node-number" x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central">
                {progress.week}
              </text>
            )}
            {state === 'done' &&
              [0, 1, 2].map((s) => (
                <path
                  key={s}
                  className={s < progress.stars ? 'node-star' : 'node-star is-empty'}
                  d={STAR}
                  transform={`translate(${cx - 25 + s * 17} ${cy + r + 6}) scale(0.68)`}
                />
              ))}
            {(state === 'current' || state === 'open') && (
              <g className="node-badge">
                <rect x={cx - 29} y={cy + r - 8} width="58" height="22" rx="11" />
                <text x={cx} y={cy + r + 3} textAnchor="middle" dominantBaseline="central">
                  {progress.learned} de {progress.total}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
