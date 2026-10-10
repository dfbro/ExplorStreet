import type { RouteInfo } from './model';

// Illustrative route records from the HTML concept. No actual geometry or
// condition data has been collected, and these paths are NOT navigable.
const seed: readonly RouteInfo[] = [
  {
    id: 'ijen-run', name: 'Ijen Morning Loop', area: 'Ijen', sport: 'run',
    distanceKm: 4.8, durationMin: 36, ascentM: 24,
    quietScore: 3, flatScore: 2, stopScore: 1,
    summary: 'Nuansa hijau untuk menemani lari pagi.',
    notes: 'Skenario lari santai berorientasi suasana. Akses pedestrian dan karakter ruas belum diverifikasi.',
    path: 'M84 263C107 175 204 235 222 133S354 92 372 173 289 278 187 282 98 302 84 263',
    start: { x: 84, y: 263 }, accent: 'lime', tags: ['Hijau', 'Santai'], verification: 'sample',
  },
  {
    id: 'kayu-run', name: 'Kayutangan Easy Steps', area: 'Kayutangan', sport: 'run',
    distanceKm: 3.5, durationMin: 29, ascentM: 12,
    quietScore: 1, flatScore: 3, stopScore: 3,
    summary: 'Jarak pendek dengan suasana perkotaan.',
    notes: 'Konsep rute pendek dengan inspirasi titik singgah kota, bukan rute hasil survei.',
    path: 'M90 99C166 63 179 233 267 204S392 245 355 288 190 306 90 99',
    start: { x: 90, y: 99 }, accent: 'gold', tags: ['Landai', 'Pit-stop'], verification: 'sample',
  },
  {
    id: 'sukun-run', name: 'Sukun Slow Sunrise', area: 'Sukun', sport: 'run',
    distanceKm: 6.2, durationMin: 49, ascentM: 19,
    quietScore: 2, flatScore: 3, stopScore: 1,
    summary: 'Inspirasi rute untuk menjaga ritme santai.',
    notes: 'Skenario lari dengan variasi elevasi contoh. Tidak ada informasi jalan aktual.',
    path: 'M134 269Q75 212 165 137T308 126Q380 189 334 260T134 269',
    start: { x: 134, y: 269 }, accent: 'sky', tags: ['Ritme santai', 'Landai'], verification: 'sample',
  },
  {
    id: 'lowok-bike', name: 'Lowokwaru Green Spin', area: 'Lowokwaru', sport: 'bike',
    distanceKm: 8.6, durationMin: 33, ascentM: 63,
    quietScore: 2, flatScore: 1, stopScore: 2,
    summary: 'Gowes kota dengan inspirasi jalur hijau.',
    notes: 'Akses legal sepeda, kondisi lalu lintas, dan permukaan tidak diuji.',
    path: 'M77 262C65 163 146 93 231 116S394 113 390 187 290 308 180 280 107 304 77 262',
    start: { x: 77, y: 262 }, accent: 'sky', tags: ['Gowes', 'Hijau'], verification: 'sample',
  },
  {
    id: 'blimbing-bike', name: 'Blimbing Coffee Cruise', area: 'Blimbing', sport: 'bike',
    distanceKm: 6.3, durationMin: 26, ascentM: 30,
    quietScore: 1, flatScore: 2, stopScore: 3,
    summary: 'Gowes sore dengan inspirasi pit-stop.',
    notes: 'Kedai, fasilitas sepeda, dan angka waktu masih simulasi.',
    path: 'M85 202Q137 79 237 140T385 215Q391 305 275 291T85 202',
    start: { x: 85, y: 202 }, accent: 'gold', tags: ['Pit-stop', 'Santai'], verification: 'sample',
  },
  {
    id: 'ijen-bike', name: 'Ijen Gentle Ride', area: 'Ijen', sport: 'bike',
    distanceKm: 12.4, durationMin: 54, ascentM: 77,
    quietScore: 3, flatScore: 1, stopScore: 1,
    summary: 'Pilihan rute panjang dengan suasana hijau.',
    notes: 'Contoh rute sepeda rekreasi. Tidak diperiksa atau direkomendasikan untuk digunakan di jalan.',
    path: 'M83 264Q90 113 199 108T388 155Q398 278 289 301T83 264',
    start: { x: 83, y: 264 }, accent: 'lime', tags: ['Gowes', 'Hijau'], verification: 'sample',
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
