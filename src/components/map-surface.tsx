import {useState} from 'react';
import {Text,View,Pressable} from 'react-native';
import WebView from 'react-native-webview';
import {MapPinned} from '@/components/icons';
import {font,palette,radius} from '@/theme/tokens';

export function MapSurface({html,height,area}:{html:string;height:number;area:string}){
 const [failed,setFailed]=useState(false);
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
    onError={()=>setFailed(true)}
    onHttpError={e=>{if(e.nativeEvent.statusCode>=400)setFailed(true);}}
  />}
 </View>;
}
