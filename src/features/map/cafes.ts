import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAreaCenter} from './areas.ts';
import {parseOverpassResponse,type OsmCafe} from './cafe-parser.ts';
export type {OsmCafe} from './cafe-parser.ts';
export type CafeLookup =
 | {status:'idle';cafes:[]}
 | {status:'loading';cafes:OsmCafe[]}
 | {status:'ready';cafes:OsmCafe[];fromCache:boolean}
 | {status:'error';cafes:[];message:string};

const endpoint='https://overpass-api.de/api/interpreter';
const CACHE_HOURS=6;
const memory=new Map<string,{time:number;data:OsmCafe[]}>();

export function osmCafeQuery(area:string):string {
 const {latitude,longitude}=getAreaCenter(area);
 return '[out:json][timeout:18];nwr["amenity"="cafe"]["name"]'
  +`(around:1300,${latitude.toFixed(6)},${longitude.toFixed(6)});out center 70;`;
}

export async function queryCafes(area:string):Promise<{cafes:OsmCafe[];fromCache:boolean}> {
 const key='explorstreet.osm-cafes.v1.'+area.toLowerCase().replace(/[^a-z]/g,'');
 const now=Date.now();
 const present=memory.get(key);
 if(present&&now-present.time<CACHE_HOURS*3600_000)return {cafes:present.data,fromCache:true};
 try{
  const record=await AsyncStorage.getItem(key);
  if(record){
   const cached=JSON.parse(record) as {time:number;data:OsmCafe[]};
   if(typeof cached.time==='number'&&now-cached.time<CACHE_HOURS*3600_000&&Array.isArray(cached.data)){
    memory.set(key,cached);
    return {cafes:cached.data,fromCache:true};
   }
  }
 }catch{ /* Cache failure must not block an explicit search. */ }
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),20_000);
 try{
  const response=await fetch(endpoint,{
   method:'POST',
   headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
   body:'data='+encodeURIComponent(osmCafeQuery(area)),
   signal:controller.signal,
  });
  if(!response.ok)throw new Error('HTTP '+response.status);
  const data=parseOverpassResponse(await response.json());
  const record={time:now,data};
  memory.set(key,record);
  AsyncStorage.setItem(key,JSON.stringify(record)).catch(()=>{});
  return {cafes:data,fromCache:false};
 }finally{clearTimeout(timeout);}
}
export function cafeErrorMessage():string{
 return 'Layanan data kafe OSM belum dapat diakses. Coba beberapa saat lagi; tidak ada data fiktif yang ditampilkan.';
}
