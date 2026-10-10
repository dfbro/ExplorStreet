export type GeoPoint=[longitude:number,latitude:number];
export type RouteActivity='run'|'bike';
export type CheckpointKind='cafe'|'store'|'rest';

export interface RouteSketchJson {
 schema:'explorstreet.route';
 version:1;
 id:string;
 title:string;
 area:string;
 activity:RouteActivity;
 geometry:{type:'LineString';coordinates:GeoPoint[]};
 distance:{estimatedKm:number;method:'straight-segment-haversine';roadSnapped:false};
 verification:'unverified';
}
export interface StoreCheckpoint {
 id:string;
 name:string;
 kind:CheckpointKind;
 coordinates:GeoPoint;
 promoted:boolean;
 promoText:string;
 notes:string;
 verification:'unverified';
}
export interface CheckpointJson {
 schema:'explorstreet.checkpoints';
 version:1;
 routeId:string;
 checkpoints:StoreCheckpoint[];
}
const radians=(value:number)=>value*Math.PI/180;
const validCoord=(point:unknown):point is GeoPoint=>
 Array.isArray(point)&&point.length===2&&point.every(n=>typeof n==='number'&&Number.isFinite(n))&&
 point[0]>=-180&&point[0]<=180&&point[1]>=-90&&point[1]<=90;
const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x:unknown,max:number)=>typeof x==='string'&&x.length<=max;
export function estimateSketchKm(coordinates:readonly GeoPoint[]):number{
 let km=0;
 for(let i=1;i<coordinates.length;i++){
  const [lon1,lat1]=coordinates[i-1],[lon2,lat2]=coordinates[i];
  const dLat=radians(lat2-lat1),dLon=radians(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(dLon/2)**2;
  km+=12742*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));
 }
 return Math.round(km*1000)/1000;
}
export function makeRouteJson(input:{
 id:string;title:string;area:string;activity:RouteActivity;coordinates:GeoPoint[];
}):RouteSketchJson{
 const data:RouteSketchJson={schema:'explorstreet.route',version:1,
  id:input.id,title:input.title,area:input.area,activity:input.activity,
  geometry:{type:'LineString',coordinates:input.coordinates},
  distance:{estimatedKm:estimateSketchKm(input.coordinates),
   method:'straight-segment-haversine',roadSnapped:false},
  verification:'unverified'};
 return validateRouteJson(data);
}
export function validateRouteJson(raw:unknown):RouteSketchJson{
 if(!obj(raw)||raw.schema!=='explorstreet.route'||raw.version!==1||
   !text(raw.id,100)||!raw.id||!text(raw.title,100)||!raw.title||
   !text(raw.area,80)||!raw.area||!['run','bike'].includes(String(raw.activity))||
   !obj(raw.geometry)||raw.geometry.type!=='LineString'||
   !Array.isArray(raw.geometry.coordinates)||raw.geometry.coordinates.length<2||
   raw.geometry.coordinates.length>120||!raw.geometry.coordinates.every(validCoord)){
  throw Error('JSON rute tidak valid: versi, identitas, atau minimal dua koordinat salah.');
 }
 // Ignore any untrusted claimed distance and recompute locally.
 return {
  schema:'explorstreet.route',version:1,id:String(raw.id),title:String(raw.title),
  area:String(raw.area),activity:raw.activity as RouteActivity,
  geometry:{type:'LineString',coordinates:raw.geometry.coordinates.map((p:GeoPoint)=>[...p] as GeoPoint)},
  distance:{estimatedKm:estimateSketchKm(raw.geometry.coordinates as GeoPoint[]),
   method:'straight-segment-haversine',roadSnapped:false},
  verification:'unverified',
 };
}
export function makeCheckpointJson(routeId:string,checkpoints:StoreCheckpoint[]):CheckpointJson{
 return validateCheckpointJson({schema:'explorstreet.checkpoints',version:1,routeId,checkpoints});
}
export function validateCheckpointJson(raw:unknown):CheckpointJson{
 if(!obj(raw)||raw.schema!=='explorstreet.checkpoints'||raw.version!==1||
   !text(raw.routeId,100)||!raw.routeId||!Array.isArray(raw.checkpoints)||raw.checkpoints.length>50){
  throw Error('JSON checkpoint tidak valid: schema, versi, atau jumlah entri salah.');
 }
 const ids=new Set<string>();
 const items:StoreCheckpoint[]=raw.checkpoints.map((item:unknown)=>{
  if(!obj(item)||!text(item.id,100)||!item.id||ids.has(String(item.id))||
   !text(item.name,100)||!item.name||!['cafe','store','rest'].includes(String(item.kind))||
   !validCoord(item.coordinates)||typeof item.promoted!=='boolean'||
   !text(item.promoText,300)||!text(item.notes,400)){
    throw Error('JSON checkpoint tidak valid: nama, jenis, promosi, atau koordinat salah.');
  }
  ids.add(String(item.id));
  return {id:String(item.id),name:String(item.name),
   kind:item.kind as CheckpointKind,coordinates:[...item.coordinates],
   promoted:item.promoted,promoText:String(item.promoText),notes:String(item.notes),
   verification:'unverified'};
 });
 return {schema:'explorstreet.checkpoints',version:1,routeId:String(raw.routeId),checkpoints:items};
}
export function parseEditorJson(textInput:string):RouteSketchJson|CheckpointJson{
 const raw=JSON.parse(textInput) as unknown;
 if(!obj(raw))throw Error('Dokumen JSON harus berbentuk objek.');
 if(raw.schema==='explorstreet.route')return validateRouteJson(raw);
 if(raw.schema==='explorstreet.checkpoints')return validateCheckpointJson(raw);
 throw Error('Schema JSON tidak dikenal. Gunakan explorstreet.route atau explorstreet.checkpoints.');
}
export function jsonText(data:RouteSketchJson|CheckpointJson){return JSON.stringify(data,null,2)+'\n';}
