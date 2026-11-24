import type { CardState } from '../engine/srs';

export type Status = 'unseen' | 'learning' | 'reviewing' | 'mastered';

export const STATUS_LABEL: Record<Status, string> = {
  unseen: 'Sin ver',
  learning: 'Aprendiendo',
  reviewing: 'Repasando',
  mastered: 'Dominado',
};

/** Agrupa las 5 cajas en 4 estados fáciles de entender. */
export function statusOf(card: CardState | undefined): Status {
  const box = card?.box ?? 0;
  if (box === 0) return 'unseen';
  if (box <= 2) return 'learning';
  if (box <= 4) return 'reviewing';
  return 'mastered';
}
