import {useEffect,useRef,useState} from 'react';
import {View} from 'react-native';
import {radius} from '@/theme/tokens';
import type {StoreCheckpoint} from '@/features/map/editor-json';
import type {MapEditorEvent} from '@/features/map/explorer-document';

export function MapSurface({html,height,area,onDestination,onEditorEvent,checkpoints}:{
 html:string;height:number;area:string;onDestination?:(point:{latitude:number;longitude:number})=>void;
 onEditorEvent?:(event:MapEditorEvent)=>void;checkpoints?:StoreCheckpoint[];
}){
 const frame=useRef<HTMLIFrameElement>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
  if(!loaded||!checkpoints)return;
  frame.current?.contentWindow?.postMessage(JSON.stringify({
   type:'explorstreet:update-checkpoints',checkpoints,
  }),'*');
 },[checkpoints,loaded]);
 useEffect(()=>{
  const callback=onDestination;
  function handle(event:MessageEvent){
   if(event.source!==frame.current?.contentWindow||typeof event.data!=='string')return;
   try{
    const msg=JSON.parse(event.data);
    if(msg.type==='explorstreet:destination'&&callback&&typeof msg.latitude==='number'&&
      typeof msg.longitude==='number'&&Number.isFinite(msg.latitude)&&Number.isFinite(msg.longitude)){
      callback?.({latitude:msg.latitude,longitude:msg.longitude});
    }
    if(onEditorEvent && msg.type==='explorstreet:sketch'&&Array.isArray(msg.coordinates))
      onEditorEvent(msg as MapEditorEvent);
    if(onEditorEvent && msg.type==='explorstreet:checkpoint-point'&&Array.isArray(msg.coordinates))
      onEditorEvent(msg as MapEditorEvent);
   }catch{}
  }
  window.addEventListener('message',handle);
  return()=>window.removeEventListener('message',handle);
 },[onDestination,onEditorEvent]);
 return <View style={{height,borderRadius:radius.large,overflow:'hidden',backgroundColor:'#e3eee5'}}>
  <iframe
    ref={frame}
    onLoad={()=>setLoaded(true)}
    title={`Peta jalan dan sketsa rute area ${area}`}
    srcDoc={html}
    loading="lazy"
    referrerPolicy="strict-origin-when-cross-origin"
    style={{width:'100%',height:'100%',border:'none',display:'block'}}
    sandbox="allow-scripts allow-same-origin allow-popups"
  />
 </View>;
}
