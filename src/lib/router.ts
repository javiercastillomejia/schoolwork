import type { SessionRequest } from '../core/session';

/**
 * Rutas con almohadilla (#/natural-science/unit-2/topic/char) para que
 * funcionen en GitHub Pages, se puedan guardar como enlace y el botón
 * "atrás" del móvil vuelva a la pantalla anterior de la app.
 */
export type Route =
  | { name: 'hub' }
  | { name: 'settings' }
  | { name: 'unit'; subject: string; unit: string }
  | { name: 'topic'; subject: string; unit: string; topic: string }
  | { name: 'session'; subject: string; unit: string; request: SessionRequest }
  | { name: 'exam'; subject: string; unit: string }
  | { name: 'cards'; subject: string; unit: string };

export type UnitRoute = Exclude<Route, { name: 'hub' } | { name: 'settings' }>;

const SLUG = /^[a-z0-9-]+$/;

export function parseHash(hash: string): Route {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((p) => decodeURIComponent(p));
  if (parts.length === 0) return { name: 'hub' };
  if (parts.length === 1 && parts[0] === 'settings') return { name: 'settings' };
  const [subject, unit, page, arg] = parts;
  if (!subject || !unit || !SLUG.test(subject) || !SLUG.test(unit)) return { name: 'hub' };
  const base = { subject, unit };
  switch (page) {
    case undefined:
      return { name: 'unit', ...base };
    case 'topic':
      return arg ? { name: 'topic', ...base, topic: arg } : { name: 'unit', ...base };
    case 'quiz':
      return arg ? { name: 'session', ...base, request: { kind: 'topic', topicId: arg } } : { name: 'unit', ...base };
    case 'daily':
      return { name: 'session', ...base, request: { kind: 'daily' } };
    case 'more':
      return { name: 'session', ...base, request: { kind: 'more' } };
    case 'mistakes':
      return {
        name: 'session',
        ...base,
        request: arg ? { kind: 'mistakes', questionIds: arg.split(',').filter(Boolean) } : { kind: 'mistakes' },
      };
    case 'exam':
      return { name: 'exam', ...base };
    case 'cards':
      return { name: 'cards', ...base };
    default:
      return { name: 'unit', ...base };
  }
}

function requestPath(request: SessionRequest): string {
  switch (request.kind) {
    case 'daily':
      return 'daily';
    case 'more':
      return 'more';
    case 'topic':
      return `quiz/${encodeURIComponent(request.topicId)}`;
    case 'mistakes':
      return request.questionIds ? `mistakes/${request.questionIds.map(encodeURIComponent).join(',')}` : 'mistakes';
  }
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'hub':
      return '#/';
    case 'settings':
      return '#/settings';
    default: {
      const base = `#/${route.subject}/${route.unit}`;
      if (route.name === 'unit') return base;
      if (route.name === 'topic') return `${base}/topic/${encodeURIComponent(route.topic)}`;
      if (route.name === 'session') return `${base}/${requestPath(route.request)}`;
      return `${base}/${route.name}`;
    }
  }
}

/** A dónde lleva "volver" cuando no hay pantalla anterior (p. ej., al abrir un enlace directo). */
export function parentOf(route: Route): Route {
  switch (route.name) {
    case 'hub':
    case 'settings':
    case 'unit':
      return { name: 'hub' };
    case 'session':
      if (route.request.kind === 'topic') {
        return { name: 'topic', subject: route.subject, unit: route.unit, topic: route.request.topicId };
      }
      return { name: 'unit', subject: route.subject, unit: route.unit };
    default:
      return { name: 'unit', subject: route.subject, unit: route.unit };
  }
}
