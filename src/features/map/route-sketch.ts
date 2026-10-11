import {roadRouteData} from './road-route-data.ts';
import {getDefaultPresets} from './presets.ts';

export type LatLng = [latitude:number, longitude:number];

export interface RoadRoute {
  source:'osm-road-graph'|'manual-sketch'|'none';
  points:LatLng[];
  profile?:'foot'|'bike';
  distanceKm?:number;
}

export function roadRouteGeometry(routeId?:string):RoadRoute {
  if(!routeId)return {source:'none',points:[]};
  const userPreset=getDefaultPresets().routes.find(route=>route.id===routeId);
  if(userPreset){
   return {source:'manual-sketch',distanceKm:userPreset.distance.estimatedKm,
    profile:userPreset.activity==='run'?'foot':'bike',
    points:userPreset.geometry.coordinates.map(([longitude,latitude])=>[latitude,longitude])};
  }
  if(!Object.hasOwn(roadRouteData,routeId))return {source:'none',points:[]};
  const route=roadRouteData[routeId as keyof typeof roadRouteData];
  return {
    source:'osm-road-graph',
    profile:route.profile,
    distanceKm:route.distanceKm,
    points:route.points.map(([latitude,longitude])=>[latitude,longitude]),
  };
}

export function straightLineKm(points:readonly LatLng[]):number{
 let distance=0;
 const R=6371, deg=Math.PI/180;
 for(let i=1;i<points.length;i++){
  const [aLat,aLon]=points[i-1],[bLat,bLon]=points[i];
  const dLat=(bLat-aLat)*deg,dLon=(bLon-aLon)*deg;
  const part=Math.sin(dLat/2)**2+Math.cos(aLat*deg)*Math.cos(bLat*deg)*Math.sin(dLon/2)**2;
  distance+=2*R*Math.atan2(Math.sqrt(part),Math.sqrt(Math.max(0,1-part)));
 }
 return distance;
}
