// Approximate area reference pins for demo context; never claim surveyed trailheads.
export type AreaName = 'Ijen' | 'Kayutangan' | 'Sukun' | 'Lowokwaru' | 'Blimbing';
export const areaCenters: Record<AreaName, {latitude:number;longitude:number;label:string}> = {
  Ijen: {latitude:-7.9728,longitude:112.6214,label:'Area Ijen'},
  Kayutangan: {latitude:-7.9728,longitude:112.6273,label:'Area Kayutangan'},
  Sukun: {latitude:-7.996,longitude:112.608,label:'Area Sukun'},
  Lowokwaru: {latitude:-7.948,longitude:112.614,label:'Area Lowokwaru'},
  Blimbing: {latitude:-7.953,longitude:112.639,label:'Area Blimbing'},
};
export const getAreaCenter=(area:string)=>areaCenters[area as AreaName] ?? {latitude:-7.98279,longitude:112.63074,label:'Kota Malang'};
export function osmUrl(area:string) {
 const c=getAreaCenter(area);
 return `https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=15/${c.latitude}/${c.longitude}`;
}
