import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import type {FeedPost,Merchant,RoadReport,SessionRecap} from './demo-data';

const KEY='explorstreet.demo-features.v1';
export interface DemoState {
 reports:RoadReport[];
 interest:string[];
 voucherViews:number;
 routeViews:number;
 promos:Merchant[];
 posts:FeedPost[];
 kudos:string[];
 recaps:SessionRecap[];
}
const blank=():DemoState=>({
 reports:[],interest:[],voucherViews:0,routeViews:0,promos:[],posts:[],kudos:[],recaps:[],
});
const arrays: (keyof DemoState)[]=['reports','interest','promos','posts','kudos','recaps'];
function coerce(raw:unknown):DemoState {
 const result=blank();
 if(!raw||typeof raw!=='object')return result;
 const input=raw as Partial<DemoState>;
 for(const key of arrays)if(Array.isArray(input[key]))(result as unknown as Record<string,unknown>)[key]=input[key];
 if(typeof input.voucherViews==='number'&&Number.isFinite(input.voucherViews))result.voucherViews=Math.max(0,input.voucherViews);
 if(typeof input.routeViews==='number'&&Number.isFinite(input.routeViews))result.routeViews=Math.max(0,input.routeViews);
 return result;
}
const makeId=(prefix:string)=>prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
interface Store {
 data:DemoState;ready:boolean;error:string|null;
 addReport:(category:string,note:string,area:string)=>void;
 toggleInterest:(eventId:string)=>void;
 viewVoucher:()=>void;
 viewRoute:()=>void;
 addPromo:(merchant:string,offer:string,price:number)=>void;
 addPost:(text:string)=>void;
 toggleKudos:(id:string)=>void;
 addRecap:(routeId:string,progress:number,elapsedSec:number)=>void;
}
const Context=createContext<Store|null>(null);
export function DemoProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<DemoState>(blank);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState<string|null>(null);
 useEffect(()=>{
  let active=true;
  AsyncStorage.getItem(KEY).then(value=>{
    if(!active||!value)return;
    setData(coerce(JSON.parse(value)));
  }).catch(()=>{if(active)setError('Data lokal tidak dapat dimuat.');})
   .finally(()=>{if(active)setReady(true);});
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
   if(!ready)return;
   AsyncStorage.setItem(KEY,JSON.stringify(data)).then(()=>setError(null))
     .catch(()=>setError('Perubahan belum tersimpan di perangkat.'));
 },[data,ready]);

 const addReport=useCallback((type:string,note:string,area:string)=>setData(prev=>({
  ...prev,reports:[{id:makeId('report'),type,note:note.slice(0,160),area,created:'Draf di perangkat'},...prev.reports].slice(0,30),
 })),[]);
 const toggleInterest=useCallback((id:string)=>setData(prev=>({
  ...prev,interest:prev.interest.includes(id)?prev.interest.filter(x=>x!==id):[...prev.interest,id],
 })),[]);
 const viewVoucher=useCallback(()=>setData(prev=>({...prev,voucherViews:prev.voucherViews+1})),[]);
 const viewRoute=useCallback(()=>setData(prev=>({...prev,routeViews:prev.routeViews+1})),[]);
 const addPromo=useCallback((merchant:string,offer:string,price:number)=>setData(prev=>({
  ...prev,promos:[{id:makeId('promo'),name:merchant.slice(0,45),area:'Mitra demo',
    price,offer:offer.slice(0,58),category:'coffee' as const,bike:false,
    description:'Promo contoh yang dibuat di dashboard mitra.',created:true},...prev.promos].slice(0,12),
 })),[]);
 const addPost=useCallback((text:string)=>setData(prev=>({
  ...prev,posts:[{id:makeId('post'),author:'Catatan pribadiku',text:text.slice(0,180),type:'private' as const},...prev.posts].slice(0,12),
 })),[]);
 const toggleKudos=useCallback((id:string)=>setData(prev=>({
  ...prev,kudos:prev.kudos.includes(id)?prev.kudos.filter(x=>x!==id):[...prev.kudos,id],
 })),[]);
 const addRecap=useCallback((routeId:string,progress:number,elapsedSec:number)=>setData(prev=>({
  ...prev,recaps:[{id:makeId('session'),routeId,progress,elapsedSec,ended:'Sesi simulator'},...prev.recaps].slice(0,12),
 })),[]);
 const context=useMemo(()=>({data,ready,error,addReport,toggleInterest,viewVoucher,viewRoute,addPromo,addPost,toggleKudos,addRecap}),
  [data,ready,error,addReport,toggleInterest,viewVoucher,viewRoute,addPromo,addPost,toggleKudos,addRecap]);
 return <Context.Provider value={context}>{children}</Context.Provider>;
}
export function useDemoStore(){
 const value=useContext(Context);
 if(!value)throw new Error('DemoProvider is required');
 return value;
}
