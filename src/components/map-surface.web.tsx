import {useEffect,useRef} from 'react';
import {View} from 'react-native';
import {radius} from '@/theme/tokens';

export function MapSurface({html,height,area,onDestination}:{
 html:string;height:number;area:string;onDestination?:(point:{latitude:number;longitude:number})=>void;
}){
 const frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{
  const callback=onDestination;
  if(!callback)return;
  function handle(event:MessageEvent){
   if(event.source!==frame.current?.contentWindow||typeof event.data!=='string')return;
   try{
    const msg=JSON.parse(event.data);
    if(msg.type==='explorstreet:destination'&&typeof msg.latitude==='number'&&
      typeof msg.longitude==='number'&&Number.isFinite(msg.latitude)&&Number.isFinite(msg.longitude)){
      callback?.({latitude:msg.latitude,longitude:msg.longitude});
    }
   }catch{}
  }
  window.addEventListener('message',handle);
  return()=>window.removeEventListener('message',handle);
 },[onDestination]);
 return <View style={{height,borderRadius:radius.large,overflow:'hidden',backgroundColor:'#e3eee5'}}>
  <iframe
    ref={frame}
    title={`Peta jalan dan sketsa rute area ${area}`}
    srcDoc={html}
    loading="lazy"
    referrerPolicy="strict-origin-when-cross-origin"
    style={{width:'100%',height:'100%',border:'none',display:'block'}}
    sandbox="allow-scripts allow-same-origin allow-popups"
  />
 </View>;
}
