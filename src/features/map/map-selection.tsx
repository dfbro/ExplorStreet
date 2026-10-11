import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';

const KEY='explorstreet.map-selection.v1';
const AREAS=['Ijen','Kayutangan','Sukun','Lowokwaru','Blimbing'];
export type MapPoint={latitude:number;longitude:number};
export type MapSelection={area:string;routeId:string|null;destination:MapPoint|null};
const initial:MapSelection={area:'Ijen',routeId:null,destination:null};

function isPoint(value:unknown):value is MapPoint{
 if(!value||typeof value!=='object')return false;
 const point=value as Partial<MapPoint>;
 return typeof point.latitude==='number'&&Number.isFinite(point.latitude)&&
  point.latitude>=-90&&point.latitude<=90&&typeof point.longitude==='number'&&
  Number.isFinite(point.longitude)&&point.longitude>=-180&&point.longitude<=180;
}
function decode(text:string):MapSelection{
 const value=JSON.parse(text) as Partial<MapSelection>;
 if(!value||!AREAS.includes(String(value.area)))return initial;
 return {
  area:value.area as string,
  routeId:typeof value.routeId==='string'&&value.routeId.length<=100?value.routeId:null,
  destination:isPoint(value.destination)?value.destination:null,
 };
}
type SelectionContext={
 selection:MapSelection;ready:boolean;error:string|null;
 selectArea:(area:string)=>void;
 selectDestination:(area:string,point:MapPoint)=>void;
 selectRoute:(area:string,id:string)=>void;
 clearDestination:()=>void;
};
const Context=createContext<SelectionContext|null>(null);

export function MapSelectionProvider({children}:{children:ReactNode}){
 const [selection,setSelection]=useState<MapSelection>(initial);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState<string|null>(null);
 useEffect(()=>{
  let active=true;
  AsyncStorage.getItem(KEY).then(value=>{
   if(active&&value)setSelection(decode(value));
  }).catch(()=>{if(active)setError('Pilihan peta sebelumnya tidak dapat dimuat.');})
   .finally(()=>{if(active)setReady(true);});
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  AsyncStorage.setItem(KEY,JSON.stringify(selection))
   .then(()=>setError(null))
   .catch(()=>setError('Pilihan peta belum tersimpan di perangkat.'));
 },[ready,selection]);
 const selectArea=useCallback((area:string)=>{
  if(!AREAS.includes(area))return;
  setSelection({area,routeId:null,destination:null});
 },[]);
 const selectDestination=useCallback((area:string,point:MapPoint)=>{
  if(!AREAS.includes(area)||!isPoint(point))return;
  setSelection({area,routeId:null,destination:point});
 },[]);
 const selectRoute=useCallback((area:string,id:string)=>{
  if(!AREAS.includes(area)||!id||id.length>100)return;
  setSelection({area,routeId:id,destination:null});
 },[]);
 const clearDestination=useCallback(()=>setSelection(current=>({...current,destination:null})),[]);
 const value=useMemo(()=>({selection,ready,error,selectArea,selectDestination,selectRoute,clearDestination}),
  [selection,ready,error,selectArea,selectDestination,selectRoute,clearDestination]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMapSelection(){
 const context=useContext(Context);
 if(!context)throw Error('MapSelectionProvider belum dipasang.');
 return context;
}
