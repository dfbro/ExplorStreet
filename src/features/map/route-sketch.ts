import {getAreaCenter} from './areas.ts';

export type LatLng = [latitude:number, longitude:number];

export interface RouteSketch {
  source:'illustration';
  points:LatLng[];
}

const variants:readonly [number,number][][] = [
  [[-.0016,-.0019],[.0018,-.0011],[.0016,.0016],[-.0013,.0018],[-.0016,-.0019]],
  [[-.0017,.0004],[.0014,-.0018],[.0020,.0006],[.0002,.0024],[-.0017,.0004]],
  [[-.0013,-.0020],[.0017,-.0003],[.0003,.0021],[-.0019,.0006],[-.0013,-.0020]],
];

export function demoSketch(area:string,routeId?:string):RouteSketch {
  const center=getAreaCenter(area);
  const sum=Array.from(routeId??area).reduce((a,char)=>a+char.charCodeAt(0),0);
  const selected=variants[sum%variants.length];
  return {
    source:'illustration',
    points:selected.map(([dLat,dLon])=>
      [Number((center.latitude+dLat).toFixed(6)),Number((center.longitude+dLon).toFixed(6))] as LatLng),
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
