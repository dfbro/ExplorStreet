import {View} from 'react-native';
import {radius} from '@/theme/tokens';

export function MapSurface({html,height,area}:{html:string;height:number;area:string}){
 return <View style={{height,borderRadius:radius.large,overflow:'hidden',backgroundColor:'#e3eee5'}}>
  <iframe
    title={`Peta jalan dan sketsa rute area ${area}`}
    srcDoc={html}
    loading="lazy"
    referrerPolicy="strict-origin-when-cross-origin"
    style={{width:'100%',height:'100%',border:'none',display:'block'}}
    sandbox="allow-scripts allow-same-origin allow-popups"
  />
 </View>;
}
