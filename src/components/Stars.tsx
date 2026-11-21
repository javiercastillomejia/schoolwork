import { Icon } from './Icon';

/** Tres estrellas, llenas según las ganadas. */
export function Stars({ count, size = 18 }: { count: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${count} de 3 estrellas`}>
      {[0, 1, 2].map((i) => (
        <Icon key={i} name="star" size={size} color={i < count ? 'var(--star)' : 'var(--star-empty)'} />
      ))}
    </span>
  );
}
