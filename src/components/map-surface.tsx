import {useEffect,useRef,useState} from 'react';
import {Text,View,Pressable} from 'react-native';
import WebView from 'react-native-webview';
import type {WebView as WebViewType} from 'react-native-webview';
import {MapPinned} from '@/components/icons';
import type {StoreCheckpoint} from '@/features/map/editor-json';
import type {MapEditorEvent} from '@/features/map/explorer-document';
import {font,palette,radius} from '@/theme/tokens';

export function MapSurface({html,height,area,onDestination,onEditorEvent,checkpoints}:{
 html:string;height:number;area:string;onDestination?:(point:{latitude:number;longitude:number})=>void;
 onEditorEvent?:(event:MapEditorEvent)=>void;checkpoints?:StoreCheckpoint[];
}){
 const [failed,setFailed]=useState(false);
 const ref=useRef<WebViewType>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
  if(!loaded||!checkpoints)return;
  const value=JSON.stringify(checkpoints).replace(/</g,'\\u003c');
  ref.current?.injectJavaScript(`window.__explorstreetSetCheckpoints?.(${value}); true;`);
 },[checkpoints,loaded]);
 return <View style={{height,borderRadius:radius.large,overflow:'hidden',backgroundColor:'#e3eee5'}}>
  {failed?<View style={{flex:1,padding:24,alignItems:'center',justifyContent:'center',gap:11}}>
    <MapPinned size={30} color={palette.forest}/>
    <Text style={{fontFamily:font.bold,color:palette.ink}}>Peta tidak dapat dimuat</Text>
    <Text style={{fontFamily:font.medium,fontSize:12,color:palette.secondaryText,textAlign:'center'}}>
     Periksa internet. Peta perlu mengunduh library dan tile OpenStreetMap.
    </Text>
    <Pressable accessibilityRole="button" onPress={()=>setFailed(false)}
      style={{minHeight:44,justifyContent:'center'}}>
      <Text style={{fontFamily:font.bold,color:palette.forest}}>Coba lagi</Text>
    </Pressable>
  </View>:<WebView
    ref={ref}
    key={area}
    source={{html,baseUrl:'https://explorstreet.local/'}}
    style={{flex:1,backgroundColor:'#e3eee5'}}
    javaScriptEnabled
    domStorageEnabled={false}
    mixedContentMode="never"
    cacheEnabled
    setSupportMultipleWindows={false}
    applicationNameForUserAgent="ExplorStreetPrototype/0.1"
    originWhitelist={['https://*','about:blank']}
    startInLoadingState
    onLoadEnd={()=>setLoaded(true)}
    onError={()=>setFailed(true)}
    onHttpError={e=>{if(e.nativeEvent.statusCode>=400)setFailed(true);}}
    onMessage={event=>{
      try{
        const message=JSON.parse(event.nativeEvent.data);
        if(onDestination&&message.type==='explorstreet:destination' &&
          typeof message.latitude==='number'&&typeof message.longitude==='number' &&
          Number.isFinite(message.latitude)&&Number.isFinite(message.longitude)){
          onDestination({latitude:message.latitude,longitude:message.longitude});
        }
        if(onEditorEvent&&message.type==='explorstreet:sketch'&&Array.isArray(message.coordinates))
          onEditorEvent(message as MapEditorEvent);
        if(onEditorEvent&&message.type==='explorstreet:checkpoint-point'&&Array.isArray(message.coordinates))
          onEditorEvent(message as MapEditorEvent);
      }catch{}
    }}
  />}
 </View>;
}
