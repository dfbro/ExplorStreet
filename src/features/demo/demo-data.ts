import type {Sport} from '@/features/routes/model';

export type EventStyle='easy'|'steady';
export interface GroupEvent {
 id:string;name:string;sport:Sport;style:EventStyle;area:string;when:string;
 organizer:string;note:string;
}
export interface Merchant {
 id:string;name:string;area:string;price:number;offer:string;
 category:'coffee'|'rest';bike:boolean;description:string;created?:boolean;
}
export interface FeedPost {id:string;author:string;text:string;type:'sample'|'private';}
export interface RoadReport {id:string;type:string;note:string;area:string;created:string;}
export interface SessionRecap {id:string;routeId:string;progress:number;elapsedSec:number;ended:string;}

export const groupEvents:GroupEvent[]=[
 {id:'g1',name:'Sunday Easy Run',sport:'run',style:'easy',area:'Ijen',when:'Minggu pagi',organizer:'Komunitas Contoh A',note:'Lari santai tanpa target kecepatan'},
 {id:'g2',name:'Sunrise Pedal Social',sport:'bike',style:'easy',area:'Lowokwaru',when:'Sabtu pagi',organizer:'Komunitas Contoh B',note:'Gowes bersama di acara terorganisasi'},
 {id:'g3',name:'Weekend Steady Run',sport:'run',style:'steady',area:'Kayutangan',when:'Akhir pekan',organizer:'Komunitas Contoh C',note:'Ritme stabil dengan titik kumpul publik'},
];
export const sampleMerchants:Merchant[]=[
 {id:'m1',name:'Kedai Pagi Contoh',area:'Ijen',price:12000,offer:'Diskon minuman contoh',category:'coffee',bike:true,description:'Minuman hangat setelah aktivitas'},
 {id:'m2',name:'Rehat Daun Studio',area:'Lowokwaru',price:18000,offer:'Bonus menu demo',category:'rest',bike:true,description:'Ruang rehat ilustratif'},
 {id:'m3',name:'Sudut Kopi Fiktif',area:'Kayutangan',price:10000,offer:'Promo sore',category:'coffee',bike:false,description:'Sudut santai di suasana kota'},
];
export const samplePosts:FeedPost[]=[
 {id:'sample1',author:'Komunitas Contoh A',type:'sample',text:'Pilih jalur yang informasinya sudah diperiksa sebelum berolahraga. Suasana menyenangkan dimulai dari persiapan.'},
 {id:'sample2',author:'Komunitas Contoh B',type:'sample',text:'Agenda gowes tidak harus soal kecepatan. Utamakan kebersamaan, etika jalan, dan titik kumpul publik.'},
];
export const checkpoints=[
 {name:'Orientasi area',detail:'Lihat konteks area pada peta. Belum ada rute jalan terverifikasi.'},
 {name:'Mulai sesi contoh',detail:'Simulator berjalan dengan waktu virtual, bukan lokasi GPS.'},
 {name:'Bagian tengah sesi',detail:'Aktivitas ilustratif, bukan instruksi belok.'},
 {name:'Jeda istirahat',detail:'Contoh checkpoint. Jangan menganggap ada fasilitas nyata.'},
 {name:'Sesi selesai',detail:'Buat rekap virtual untuk layar Feed.'},
];
export function rupiah(price:number){
 return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(price);
}
