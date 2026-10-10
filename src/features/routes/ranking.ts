import type { RouteFilters, RouteInfo } from './model';

function distanceScore(km: number, band: RouteFilters['distance']): number {
  switch (band) {
    case 'short': return km <= 4 ? 14 : -Math.abs(km - 3) * 4;
    case 'medium': return km >= 4 && km <= 7 ? 14 : -Math.abs(km - 5.5) * 4;
    case 'long': return km > 7 ? 14 : -Math.abs(km - 9) * 4;
    case 'custom': return 0;
    default: return 0;
  }
}

export function rankRoute(route: RouteInfo, filters: RouteFilters): number {
  const { weights } = filters;
  return (
    route.quietScore * weights.quiet +
    route.flatScore * weights.flat +
    route.stopScore * weights.stops +
    distanceScore(route.distanceKm, filters.distance) +
    (filters.area && route.area === filters.area ? 18 : 0)
  );
}

export function rankRoutes(
  routes: readonly RouteInfo[],
  filters: RouteFilters,
  favorites: ReadonlySet<string>,
): RouteInfo[] {
  const search = filters.query.trim().toLocaleLowerCase('id-ID');
  return routes
    .filter((route) => filters.savedOnly ? favorites.has(route.id) : route.sport === filters.sport)
    .filter((route) => {
      if (filters.savedOnly || filters.distance === 'all') return true;
      if (filters.distance === 'custom') {
        return (filters.minKm === null || route.distanceKm >= filters.minKm) &&
          (filters.maxKm === null || route.distanceKm <= filters.maxKm);
      }
      if (filters.distance === 'short') return route.distanceKm <= 4;
      if (filters.distance === 'medium') return route.distanceKm > 4 && route.distanceKm <= 7;
      return route.distanceKm > 7;
    })
    .filter((route) => !search || [route.name, route.area, ...route.tags].join(' ').toLocaleLowerCase('id-ID').includes(search))
    .sort((a, b) => rankRoute(b, filters) - rankRoute(a, filters) || a.distanceKm - b.distanceKm);
}

export const formatDistance = (km: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(km);
