import type {ReactNode} from 'react';
import {ScrollView,Text,View,useWindowDimensions} from 'react-native';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppFooterNotice,AppHeader,AppNav} from './app-nav';
import {font,palette} from '@/theme/tokens';

export function AppPage({title,subtitle,children,partner=false}:{
 title:string;subtitle?:string;children:ReactNode;partner?:boolean;
}){
 const {width}=useWindowDimensions();
 const insets=useSafeAreaInsets();
 return <SafeAreaView edges={['top']} style={{flex:1,backgroundColor:palette.background}}>
  <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic"
   contentContainerStyle={{alignSelf:'center',width:'100%',maxWidth:1080,paddingHorizontal:18,
    paddingTop:14,paddingBottom:92+insets.bottom,gap:17}}>
   <AppHeader partner={partner}/>
   <View style={{gap:5,marginTop:4}}>
    <Text style={{fontFamily:font.extra,color:palette.ink,fontSize:width>720?34:28,lineHeight:width>720?39:34,
     letterSpacing:-.65}}>{title}</Text>
    {subtitle?<Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:13,lineHeight:20}}>
      {subtitle}</Text>:null}
   </View>
   {children}
   <AppFooterNotice/>
  </ScrollView>
  <AppNav/>
 </SafeAreaView>;
}
