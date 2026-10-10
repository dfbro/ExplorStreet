import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { DistanceBand, Priority, RouteFilters, Sport } from './model';
import { DEFAULT_FILTERS } from './model';

const STORAGE_KEY = 'explorstreet.route-preferences.v1';

type Stored = { sport: Sport; distance: DistanceBand; weights: RouteFilters['weights']; favorites: string[] };
interface RoutePreferencesContextValue {
  filters: RouteFilters;
  favorites: ReadonlySet<string>;
  ready: boolean;
  saveError: string | null;
  setSport: (sport: Sport) => void;
  setDistance: (distance: DistanceBand) => void;
  setQuery: (query: string) => void;
  setSavedOnly: (saved: boolean) => void;
  setWeight: (key: keyof RouteFilters['weights'], value: Priority) => void;
  toggleFavorite: (id: string) => void;
  clearSaveError: () => void;
}
const Context = createContext<RoutePreferencesContextValue | null>(null);

function isSport(value: unknown): value is Sport { return value === 'run' || value === 'bike'; }
function isDistance(value: unknown): value is DistanceBand {
  return value === 'all' || value === 'short' || value === 'medium' || value === 'long';
}
function priority(value: unknown, fallback: Priority): Priority {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3
    ? value as Priority : fallback;
}

export function RoutePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<RouteFilters>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || !active) return;
        const decoded = JSON.parse(stored) as Partial<Stored>;
        const weights = decoded.weights;
        setFilters((old) => ({
          ...old,
          sport: isSport(decoded.sport) ? decoded.sport : old.sport,
          distance: isDistance(decoded.distance) ? decoded.distance : old.distance,
          weights: {
            quiet: priority(weights?.quiet, old.weights.quiet),
            flat: priority(weights?.flat, old.weights.flat),
            stops: priority(weights?.stops, old.weights.stops),
          },
        }));
        if (Array.isArray(decoded.favorites)) {
          setFavorites(new Set(decoded.favorites.filter((id): id is string => typeof id === 'string')));
        }
      })
      .catch(() => { if (active) setSaveError('Preferensi tidak dapat dimuat dari perangkat.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const snapshot: Stored = {
      sport: filters.sport, distance: filters.distance,
      weights: filters.weights, favorites: Array.from(favorites),
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      .then(() => setSaveError(null))
      .catch(() => setSaveError('Perubahan belum tersimpan. Coba lagi nanti.'));
  }, [filters.sport, filters.distance, filters.weights, favorites, ready]);

  const setSport = useCallback((sport: Sport) => setFilters((previous) => ({ ...previous, sport, savedOnly: false })), []);
  const setDistance = useCallback((distance: DistanceBand) => setFilters((previous) => ({ ...previous, distance })), []);
  const setQuery = useCallback((query: string) => setFilters((previous) => ({ ...previous, query })), []);
  const setSavedOnly = useCallback((savedOnly: boolean) => setFilters((previous) => ({ ...previous, savedOnly })), []);
  const setWeight = useCallback((key: keyof RouteFilters['weights'], value: Priority) =>
    setFilters((previous) => ({ ...previous, weights: { ...previous.weights, [key]: value } })), []);
  const toggleFavorite = useCallback((id: string) => setFavorites((previous) => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  }), []);
  const clearSaveError = useCallback(() => setSaveError(null), []);

  const value = useMemo(() => ({
    filters, favorites, ready, saveError, setSport, setDistance,
    setQuery, setSavedOnly, setWeight, toggleFavorite, clearSaveError,
  }), [filters, favorites, ready, saveError, setSport, setDistance, setQuery,
    setSavedOnly, setWeight, toggleFavorite, clearSaveError]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRoutePreferences() {
  const context = useContext(Context);
  if (!context) throw new Error('useRoutePreferences must be used inside RoutePreferencesProvider');
  return context;
}
