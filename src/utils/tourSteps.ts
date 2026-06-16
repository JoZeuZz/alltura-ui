export type TourRole = 'admin' | 'supervisor';

export interface TourStep {
  id: string;
  role: TourRole;
  route?: string;
  selector?: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  mobilePlacement?: 'bottom' | 'center' | 'top';
  highlightPadding?: number;
  autoNavigate?: boolean;
  demoAction?: string;
}

const normalizePath = (path: string) => {
  if (!path) return '/';
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

export const matchTourRoute = (pathname: string, route?: string) => {
  if (!route || route === '*') return true;
  const cleanPath = normalizePath(pathname);
  const cleanRoute = normalizePath(route);
  if (cleanRoute.includes(':')) {
    const pattern = `^${cleanRoute.replace(/:[^/]+/g, '[^/]+')}$`;
    return new RegExp(pattern).test(cleanPath);
  }
  return cleanPath === cleanRoute;
};
