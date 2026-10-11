import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {getDefaultPresets} from './presets';
import {validateRouteJson,validateCheckpointJson,type RouteSketchJson,type CheckpointJson,type StoreCheckpoint} from './editor-json';

const KEY='explorstreet.shared-presets.v1';
type Mode='user'|'admin';
export type LocalPresetState={version:1;mode:Mode;routes:RouteSketchJson[];checkpointSets:CheckpointJson[]};
const builtIn=getDefaultPresets();
const initial:LocalPresetState={version:1,mode:'user',routes:builtIn.routes,checkpointSets:builtIn.checkpointSets};

export function validateLocalPresetState(raw:unknown):LocalPresetState{
 if(!raw||typeof raw!=='object')throw Error('Penyimpanan preset tidak valid.');
 const data=raw as Partial<LocalPresetState>;
 if(data.version!==1||!['user','admin'].includes(String(data.mode))||
  !Array.isArray(data.routes)||!Array.isArray(data.checkpointSets)||
  data.routes.length>80||data.checkpointSets.length>80)throw Error('Versi atau ukuran penyimpanan tidak didukung.');
 const routes=data.routes.map(validateRouteJson);
 const checkpointSets=data.checkpointSets.map(validateCheckpointJson);
 const ids=routes.map(r=>r.id);
 if(new Set(ids).size!==ids.length)throw Error('ID rute duplikat.');
 if(new Set(checkpointSets.map(s=>s.routeId)).size!==checkpointSets.length ||
 checkpointSets.some(s=>!ids.includes(s.routeId)))throw Error('Checkpoint tidak terhubung ke rute.');
 return {version:1,mode:data.mode as Mode,routes,checkpointSets};
}
type StoreContext=LocalPresetState & {
 ready:boolean;error:string|null;setMode:(value:Mode)=>void;
 saveRoute:(route:RouteSketchJson,checkpoints?:StoreCheckpoint[])=>void;
 saveCheckpoint:(routeId:string,checkpoint:StoreCheckpoint)=>void;
 deleteCheckpoint:(routeId:string,id:string)=>void;
 deleteRoute:(routeId:string)=>void;
};
const Context=createContext<StoreContext|null>(null);
export function PresetStoreProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<LocalPresetState>(initial);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState<string|null>(null);
 useEffect(()=>{
  let alive=true;
  AsyncStorage.getItem(KEY).then(value=>{
   if(!alive||!value)return;
   setState(validateLocalPresetState(JSON.parse(value)));
  }).catch(()=>{if(alive)setError('Preset lokal tidak bisa dimuat; preset bawaan tetap tersedia.');})
  .finally(()=>{if(alive)setReady(true);});
  return()=>{alive=false;};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  AsyncStorage.setItem(KEY,JSON.stringify(state)).then(()=>setError(null))
   .catch(()=>setError('Gagal menyimpan perubahan di perangkat.'));
 },[state,ready]);
 const setMode=useCallback((mode:Mode)=>setState(old=>({...old,mode})),[]);
 const saveRoute=useCallback((raw:RouteSketchJson,stops?:StoreCheckpoint[])=>{
  const route=validateRouteJson(raw);
  const set=stops===undefined?undefined:validateCheckpointJson({
    schema:'explorstreet.checkpoints',version:1,routeId:route.id,checkpoints:stops,
  });
  setState(old=>{
   const routes=[...old.routes.filter(r=>r.id!==route.id),route];
   const checkpointSets=set
    ?[...old.checkpointSets.filter(s=>s.routeId!==route.id),set]
    :old.checkpointSets;
   return validateLocalPresetState({...old,routes,checkpointSets});
  });
 },[]);
 const saveCheckpoint=useCallback((routeId:string,raw:StoreCheckpoint)=>{
  setState(old=>{
   if(!old.routes.some(r=>r.id===routeId))throw Error('Simpan rute sebelum menambah checkpoint.');
   const current=old.checkpointSets.find(c=>c.routeId===routeId)?.checkpoints??[];
   const updated=[...current.filter(c=>c.id!==raw.id),raw];
   const set=validateCheckpointJson({schema:'explorstreet.checkpoints',version:1,routeId,checkpoints:updated});
   return validateLocalPresetState({...old,checkpointSets:[...old.checkpointSets.filter(c=>c.routeId!==routeId),set]});
  });
 },[]);
 const deleteCheckpoint=useCallback((routeId:string,id:string)=>setState(old=>({
  ...old,checkpointSets:old.checkpointSets.map(set=>set.routeId!==routeId
   ?set:{...set,checkpoints:set.checkpoints.filter(c=>c.id!==id)})
 })),[]);
 const deleteRoute=useCallback((id:string)=>setState(old=>({
  ...old,routes:old.routes.filter(r=>r.id!==id),
  checkpointSets:old.checkpointSets.filter(set=>set.routeId!==id),
 })),[]);
 const value=useMemo(()=>({...state,ready,error,setMode,saveRoute,saveCheckpoint,deleteCheckpoint,deleteRoute}),
 [state,ready,error,setMode,saveRoute,saveCheckpoint,deleteCheckpoint,deleteRoute]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePresetStore(){
 const context=useContext(Context);
 if(!context)throw Error('PresetStoreProvider belum dipasang.');
 return context;
}
