import { Icon } from './Icon';

export function SessionBar({ index, total, onExit }: { index: number; total: number; onExit: () => void }) {
  const percent = total === 0 ? 0 : Math.round((index / total) * 100);
  return (
    <header className="session-bar">
      <button type="button" className="icon-btn" onClick={onExit} aria-label="Salir">
        <Icon name="close" size={20} strokeWidth={3} />
      </button>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index} aria-label="Progreso">
        <span style={{ width: `${Math.max(percent, 4)}%` }} />
      </div>
      <span className="session-count">
        {Math.min(index + 1, total)}/{total}
      </span>
    </header>
  );
}
