import type { ListItem, StudyBlock } from '../core/types';
import { Rich } from './Rich';

/** Columnas de una tabla que son cortas (p. ej., "Cold", "Yes"): se ven como etiquetas. */
function shortColumns(head: string[], rows: string[][]): Set<number> {
  const short = new Set<number>();
  head.forEach((_, j) => {
    if (j > 0 && rows.every((row) => (row[j] ?? '').length <= 12)) short.add(j);
  });
  return short;
}

function List({ items }: { items: ListItem[] }) {
  return (
    <ul className="study-list">
      {items.map((item, i) =>
        typeof item === 'string' ? (
          <li key={i}>
            <Rich text={item} />
          </li>
        ) : (
          <li key={i}>
            <Rich text={item.text} />
            <List items={item.items} />
          </li>
        ),
      )}
    </ul>
  );
}

function Tree({ item, depth = 0, gaps }: { item: ListItem; depth?: number; gaps: boolean }) {
  const text = typeof item === 'string' ? item : item.text;
  const children = typeof item === 'string' ? [] : item.items;
  return (
    <li className={`tree-node depth-${Math.min(depth, 3)}`}>
      <span className="tree-label">
        <Rich text={text} gaps={gaps} />
      </span>
      {children.length > 0 && (
        <ul>
          {children.map((child, i) => (
            <Tree key={i} item={child} depth={depth + 1} gaps={gaps} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Block({ block, gaps }: { block: StudyBlock; gaps: boolean }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="study-heading">
          <Rich text={block.text} />
        </h3>
      );
    case 'p':
      return (
        <p className="study-p">
          <Rich text={block.text} />
        </p>
      );
    case 'list':
      return <List items={block.items} />;
    case 'table': {
      const short = shortColumns(block.head, block.rows);
      return (
        <div className="row-cards">
          {block.rows.map((row, i) => (
            <div key={i} className="row-card">
              <div className="row-card-head">
                <strong className="row-card-title">
                  <Rich text={row[0] ?? ''} />
                </strong>
                {[...short].map((j) => (
                  <span key={j} className="row-chip">
                    <span className="row-chip-label">{block.head[j]}:</span> {row[j]}
                  </span>
                ))}
              </div>
              {row.slice(1).map((cell, k) =>
                short.has(k + 1) ? null : (
                  <p key={k} className="row-card-field">
                    {block.head.length > 2 && <span className="row-field-label">{block.head[k + 1]}: </span>}
                    <Rich text={cell} />
                  </p>
                ),
              )}
            </div>
          ))}
        </div>
      );
    }
    case 'pairs':
      return (
        <div className="pairs">
          {block.title && (
            <p className="pairs-title">
              <Rich text={block.title} />
            </p>
          )}
          <ul className="pair-list">
            {block.items.map(([a, b]) => (
              <li key={a} className="pair">
                <strong>{a}</strong>
                <span className="pair-arrow" aria-hidden="true">
                  →
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'tip':
      return (
        <p className="tip">
          <span className="tip-icon" aria-hidden="true">
            💡
          </span>
          <span>
            <Rich text={block.text} />
          </span>
        </p>
      );
    case 'note':
      return (
        <p className="parent-note" lang="es">
          <strong>Nota para la familia:</strong> {block.text}
        </p>
      );
    case 'dialogue':
      return (
        <div className="dialogue">
          {block.lines.map((line, i) =>
            line.who ? (
              <div key={i} className={`speech ${line.who.toLowerCase().includes('aunty') ? 'is-left' : 'is-right'}`}>
                <span className="speech-who">{line.who}</span>
                <p className="speech-text">
                  <Rich text={line.text} />
                </p>
              </div>
            ) : (
              <p key={i} className="narration">
                <Rich text={line.text} />
              </p>
            ),
          )}
        </div>
      );
    case 'tree':
      return (
        <ul className="tree">
          <Tree item={block.root} gaps={gaps} />
        </ul>
      );
    case 'steps':
      return (
        <div className="steps-block">
          {block.title && (
            <p className="pairs-title">
              <Rich text={block.title} />
            </p>
          )}
          <ol className="step-list">
            {block.items.map((item, i) => (
              <li key={i} className="step-chip">
                <Rich text={item} />
              </li>
            ))}
          </ol>
        </div>
      );
  }
}

/**
 * La ficha de estudio de un tema. `active` marca el bloque que se está leyendo
 * en voz alta; con `gaps`, el mapa conceptual esconde sus palabras clave.
 */
export function StudySheet({
  blocks,
  active,
  lang,
  gaps = false,
}: {
  blocks: StudyBlock[];
  active: number | null;
  lang: string;
  gaps?: boolean;
}) {
  return (
    <div className="study" lang={lang}>
      {blocks.map((block, i) => (
        <div key={i} data-block={i} className={`study-block ${active === i ? 'is-reading' : ''}`}>
          <Block block={block} gaps={gaps} />
        </div>
      ))}
    </div>
  );
}
