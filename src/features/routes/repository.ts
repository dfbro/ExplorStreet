import type { RouteInfo } from './model';
import {roadRouteData} from '../map/road-route-data.ts';

// Distances below are based on cached FOSSGIS OSRM road-graph routes.
// Durations, ascent and condition scores remain illustrative and unverified.
const seed: readonly RouteInfo[] = [
  {
    id: 'ijen-run', name: 'Ijen Morning Loop', area: 'Ijen', sport: 'run',
    distanceKm: roadRouteData['ijen-run'].distanceKm, durationMin: 28, ascentM: 24,
    quietScore: 3, flatScore: 2, stopScore: 1,
    summary: 'Nuansa hijau untuk menemani lari pagi.',
    notes: 'Skenario lari santai berorientasi suasana. Akses pedestrian dan karakter ruas belum diverifikasi.',
    accent: 'lime', tags: ['Hijau', 'Santai'], verification: 'sample',
  },
  {
    id: 'kayu-run', name: 'Kayutangan Easy Steps', area: 'Kayutangan', sport: 'run',
    distanceKm: roadRouteData['kayu-run'].distanceKm, durationMin: 26, ascentM: 12,
    quietScore: 1, flatScore: 3, stopScore: 3,
    summary: 'Jarak pendek dengan suasana perkotaan.',
    notes: 'Konsep rute pendek dengan inspirasi titik singgah kota, bukan rute hasil survei.',
    accent: 'gold', tags: ['Landai', 'Pit-stop'], verification: 'sample',
  },
  {
    id: 'sukun-run', name: 'Sukun Slow Sunrise', area: 'Sukun', sport: 'run',
    distanceKm: roadRouteData['sukun-run'].distanceKm, durationMin: 56, ascentM: 19,
    quietScore: 2, flatScore: 3, stopScore: 1,
    summary: 'Inspirasi rute untuk menjaga ritme santai.',
    notes: 'Skenario lari dengan variasi elevasi contoh. Tidak ada informasi jalan aktual.',
    accent: 'sky', tags: ['Ritme santai', 'Landai'], verification: 'sample',
  },
  {
    id: 'lowok-bike', name: 'Lowokwaru Green Spin', area: 'Lowokwaru', sport: 'bike',
    distanceKm: roadRouteData['lowok-bike'].distanceKm, durationMin: 40, ascentM: 63,
    quietScore: 2, flatScore: 1, stopScore: 2,
    summary: 'Gowes kota dengan inspirasi jalur hijau.',
    notes: 'Akses legal sepeda, kondisi lalu lintas, dan permukaan tidak diuji.',
    accent: 'sky', tags: ['Gowes', 'Hijau'], verification: 'sample',
  },
  {
    id: 'blimbing-bike', name: 'Blimbing Coffee Cruise', area: 'Blimbing', sport: 'bike',
    distanceKm: roadRouteData['blimbing-bike'].distanceKm, durationMin: 36, ascentM: 30,
    quietScore: 1, flatScore: 2, stopScore: 3,
    summary: 'Gowes sore dengan inspirasi pit-stop.',
    notes: 'Kedai, fasilitas sepeda, dan angka waktu masih simulasi.',
    accent: 'gold', tags: ['Pit-stop', 'Santai'], verification: 'sample',
  },
  {
    id: 'ijen-bike', name: 'Ijen Gentle Ride', area: 'Ijen', sport: 'bike',
    distanceKm: roadRouteData['ijen-bike'].distanceKm, durationMin: 54, ascentM: 77,
    quietScore: 3, flatScore: 1, stopScore: 1,
    summary: 'Pilihan rute panjang dengan suasana hijau.',
    notes: 'Contoh rute sepeda rekreasi. Tidak diperiksa atau direkomendasikan untuk digunakan di jalan.',
    accent: 'lime', tags: ['Gowes', 'Hijau'], verification: 'sample',
  },
];

export interface RouteRepository {
  list(): Promise<readonly RouteInfo[]>;
  find(id: string): Promise<RouteInfo | null>;
}

export const routeRepository: RouteRepository = {
  async list() {
    return seed;
  },
  async find(id) {
    return seed.find((route) => route.id === id) ?? null;
  },
};
