import { router, usePathname } from 'expo-router';
import {Compass, Coffee, Map, MessagesSquare, Users} from '@/components/icons';
import {Pressable,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {font,palette} from '@/theme/tokens';
import {usePresetStore} from '@/features/map/preset-store';

const tabs=[
 {href:'/' as const,title:'Rute',Icon:Compass},
 {href:'/nav' as const,title:'Navigasi',Icon:Map},
 {href:'/buddy' as const,title:'Buddy',Icon:Users},
 {href:'/stops' as const,title:'Pit-stop',Icon:Coffee},
 {href:'/feed' as const,title:'Feed',Icon:MessagesSquare},
];

export function AppNav(){
 const {mode}=usePresetStore();
 const path=usePathname(),insets=useSafeAreaInsets();
 if(mode==='admin')return <View style={{position:'absolute',left:0,right:0,bottom:0,zIndex:10,
   backgroundColor:palette.surface,borderTopWidth:1,borderColor:palette.line,
   padding:8,paddingBottom:12}}>
   <Pressable accessibilityRole="tab" accessibilityLabel="Kelola preset admin" onPress={()=>router.replace('/admin')}
    style={{minHeight:51,borderRadius:13,backgroundColor:palette.pale,alignItems:'center',justifyContent:'center'}}>
    <Text style={{fontFamily:font.bold,color:palette.forest}}>Admin • Kelola rute & checkpoint</Text>
   </Pressable>
  </View>;
 return <View style={{position:'absolute',left:0,right:0,bottom:0,zIndex:10,
   backgroundColor:palette.surface,borderTopWidth:1,borderColor:palette.line,
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
 const {mode,setMode}=usePresetStore();
 const admin=mode==='admin';
 return <View style={{flexDirection:'row',gap:12,alignItems:'center',justifyContent:'space-between'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8,flexShrink:1}}>
   <View style={{width:37,height:37,borderRadius:13,backgroundColor:palette.lime,alignItems:'center',justifyContent:'center'}}>
    <Compass size={24} color={palette.forest}/>
   </View>
   <Text numberOfLines={1} adjustsFontSizeToFit
    style={{fontFamily:font.extra,fontSize:24,letterSpacing:-1.3,color:palette.ink}}>explorstreet<Text style={{color:palette.pine}}>.</Text></Text>
  </View>
  <Pressable onPress={()=>{setMode(admin?'user':'admin');router.replace(admin?'/':'/admin');}} accessibilityRole="switch"
    accessibilityLabel="Mode admin" accessibilityState={{checked:admin}}
    style={({pressed})=>({minHeight:43,borderRadius:23,paddingHorizontal:10,alignItems:'center',
     flexDirection:'row',gap:6,backgroundColor:admin?palette.forest:palette.pale,opacity:pressed?.7:1})}>
   <Text style={{fontFamily:font.bold,color:admin?'white':palette.forest,fontSize:11}}>{admin?'Admin':'User'}</Text>
   <View style={{width:27,height:16,borderRadius:10,backgroundColor:admin?'#B4F19A':'#ADCDB4',
    justifyContent:'center',alignItems:admin?'flex-end':'flex-start',padding:2}}>
    <View style={{height:12,width:12,borderRadius:8,backgroundColor:admin?palette.forest:'white'}}/>
   </View>
  </Pressable>
 </View>;
}
export function AppFooterNotice(){
 return <Text style={{fontFamily:font.medium,fontSize:11,color:palette.secondaryText,lineHeight:17,textAlign:'center'}}>
   ExplorStreet Alpha. Fitur sosial, promo, dan data rute masih simulasi lokal.
  </Text>;
}
