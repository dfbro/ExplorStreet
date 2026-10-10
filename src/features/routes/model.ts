export type Sport = 'run' | 'bike';
export type DistanceBand = 'all' | 'short' | 'medium' | 'long';
export type Priority = 0 | 1 | 2 | 3;

export interface RouteInfo {
  id: string;
  name: string;
  area: string;
  sport: Sport;
  distanceKm: number;
  durationMin: number;
  ascentM: number;
  quietScore: Priority;
  flatScore: Priority;
  stopScore: Priority;
  summary: string;
  notes: string;
  path: string;
  start: { x: number; y: number };
  accent: 'lime' | 'gold' | 'sky';
  tags: string[];
  verification: 'sample';
}

export interface RouteWeights {
  quiet: Priority;
  flat: Priority;
  stops: Priority;
}

export interface RouteFilters {
  sport: Sport;
  distance: DistanceBand;
  weights: RouteWeights;
  query: string;
  savedOnly: boolean;
}

export const DEFAULT_FILTERS: RouteFilters = {
  sport: 'run',
  distance: 'all',
  weights: { quiet: 3, flat: 2, stops: 1 },
  query: '',
  savedOnly: false,
};

export const PRIORITY_TEXT: Record<Priority, string> = {
  0: 'Tidak penting',
  1: 'Boleh ada',
  2: 'Cukup penting',
  3: 'Prioritas tinggi',
};
