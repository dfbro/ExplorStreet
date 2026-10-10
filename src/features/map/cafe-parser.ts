export interface OsmCafe {
 id:string;
 name:string;
 latitude:number;
 longitude:number;
 address?:string;
 website?:string;
 osmUrl:string;
}

function parseCafe(raw:unknown):OsmCafe|null{
 if(!raw||typeof raw!=='object')return null;
 const item=raw as Record<string,unknown>;
 const tags=item.tags;
 if(!tags||typeof tags!=='object'||typeof item.type!=='string')return null;
 const t=tags as Record<string,unknown>;
 if(typeof t.name!=='string'||!t.name.trim()||!Number.isSafeInteger(item.id)||Number(item.id)<=0)return null;
 const center=(item.center&&typeof item.center==='object'?item.center:item) as Record<string,unknown>;
 if(typeof center.lat!=='number'||typeof center.lon!=='number'||!Number.isFinite(center.lat)||!Number.isFinite(center.lon))return null;
 // The alpha only renders POIs plausibly located near Malang.
 if(center.lat < -8.08||center.lat > -7.84||center.lon < 112.52||center.lon > 112.73)return null;
 if(!['node','way','relation'].includes(item.type))return null;
 const id=item.type+'/'+item.id;
 const addr=[t['addr:street'],t['addr:housenumber']].filter(v=>typeof v==='string').join(' ');
 return {
   id,name:t.name.trim().slice(0,90),latitude:center.lat,longitude:center.lon,
   address:addr||undefined,
   website:typeof t.website==='string'&&/^https:\/\//.test(t.website)?t.website:undefined,
   osmUrl:'https://www.openstreetmap.org/'+id,
 };
}

export function parseOverpassResponse(input:unknown):OsmCafe[]{
 if(!input||typeof input!=='object')return [];
 const elements=(input as {elements?:unknown}).elements;
 if(!Array.isArray(elements))return [];
 const ids=new Set<string>();
 const parsed:OsmCafe[]=[];
 for(const candidate of elements){
  const cafe=parseCafe(candidate);
  if(!cafe||ids.has(cafe.id))continue;
  ids.add(cafe.id);parsed.push(cafe);
  if(parsed.length>=45)break;
 }
 return parsed;
}
