import { router, usePathname } from 'expo-router';
import {Compass, Coffee, Map, MessagesSquare, Store, Users} from '@/components/icons';
import {Pressable,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {font,palette} from '@/theme/tokens';

const tabs=[
 {href:'/' as const,title:'Rute',Icon:Compass},
 {href:'/nav' as const,title:'Navigasi',Icon:Map},
 {href:'/buddy' as const,title:'Buddy',Icon:Users},
 {href:'/stops' as const,title:'Pit-stop',Icon:Coffee},
 {href:'/feed' as const,title:'Feed',Icon:MessagesSquare},
];

export function AppNav(){
 const path=usePathname(),insets=useSafeAreaInsets();
 return <View style={{backgroundColor:palette.surface,borderTopWidth:1,borderColor:palette.line,
   flexDirection:'row',paddingHorizontal:6,paddingTop:7,paddingBottom:Math.max(insets.bottom,9)}}>
  {tabs.map(({href,title,Icon})=>{
   const selected=path===href;
   return <Pressable key={href} onPress={()=>router.replace(href)}
      accessibilityRole="tab" accessibilityLabel={title} accessibilityState={{selected}}
      style={({pressed})=>({flex:1,minHeight:53,justifyContent:'center',alignItems:'center',gap:3,
       borderRadius:14,backgroundColor:selected?palette.pale:'transparent',opacity:pressed?.7:1})}>
     <Icon size={21} color={selected?palette.forest:'#67836F'}/>
     <Text style={{fontFamily:font.bold,fontSize:10,color:selected?palette.forest:palette.secondaryText}}>{title}</Text>
    </Pressable>;
  })}
 </View>;
}
export function AppHeader({partner=false}:{partner?:boolean}){
 return <View style={{flexDirection:'row',gap:12,alignItems:'center',justifyContent:'space-between'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8,flexShrink:1}}>
   <View style={{width:37,height:37,borderRadius:13,backgroundColor:palette.lime,alignItems:'center',justifyContent:'center'}}>
    <Compass size={24} color={palette.forest}/>
   </View>
   <Text numberOfLines={1} adjustsFontSizeToFit
    style={{fontFamily:font.extra,fontSize:24,letterSpacing:-1.3,color:palette.ink}}>explorstreet<Text style={{color:palette.pine}}>.</Text></Text>
  </View>
  <Pressable onPress={()=>router.push('/partner')} accessibilityRole="button"
    style={({pressed})=>({minHeight:42,borderRadius:13,paddingHorizontal:11,alignItems:'center',
     flexDirection:'row',gap:5,backgroundColor:partner?palette.forest:palette.pale,opacity:pressed?.7:1})}>
   <Store size={16} color={partner?'white':palette.forest}/>
   <Text style={{fontFamily:font.bold,color:partner?'white':palette.forest,fontSize:11}}>Mitra</Text>
  </Pressable>
 </View>;
}
export function AppFooterNotice(){
 return <Text style={{fontFamily:font.medium,fontSize:11,color:palette.secondaryText,lineHeight:17,textAlign:'center'}}>
   ExplorStreet Alpha. Fitur sosial, promo, dan data rute masih simulasi lokal.
  </Text>;
}
