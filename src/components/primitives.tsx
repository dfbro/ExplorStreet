import type {ReactNode} from 'react';
import {Pressable,Text,TextInput,View} from 'react-native';
import type {TextInputProps} from 'react-native';
import type {AppIcon} from '@/components/icons';
import {font,palette,radius} from '@/theme/tokens';

export function Panel({children,tint=false}:{children:ReactNode;tint?:boolean}){
 return <View style={{padding:17,borderRadius:radius.large,
  borderWidth:1,borderColor:tint?'#CFE5C6':palette.line,
  backgroundColor:tint?palette.pale:palette.surface,gap:13}}>{children}</View>;
}
export function Heading({children,icon:Icon}:{children:ReactNode;icon?:AppIcon}){
 return <View style={{flexDirection:'row',alignItems:'center',gap:9}}>
   {Icon?<Icon size={20} color={palette.pine}/>:null}
   <Text style={{fontFamily:font.display,fontSize:21,color:palette.ink,flexShrink:1}}>{children}</Text>
 </View>;
}
export function Body({children}:{children:ReactNode}){
 return <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:13,lineHeight:20}}>{children}</Text>;
}
export function Action({label,onPress,icon:Icon,kind='primary',disabled=false}:{
 label:string;onPress:()=>void;icon?:AppIcon;kind?:'primary'|'secondary'|'outline';disabled?:boolean;
}){
 const background=kind==='primary'?palette.forest:kind==='secondary'?'#F9FCF6':palette.surface;
 const foreground=kind==='primary'?palette.white:palette.forest;
 return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
   style={({pressed})=>({minHeight:48,borderWidth:kind==='primary'?0:1,borderColor:'#D6E5D1',
    paddingHorizontal:15,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',
    gap:9,backgroundColor:background,opacity:disabled?.48:pressed?.7:1})}>
    {Icon?<Icon size={18} color={foreground}/>:null}
    <Text style={{fontFamily:font.bold,fontSize:13,color:foreground,textAlign:'center'}}>{label}</Text>
  </Pressable>;
}
export function Chip({label,active=false,onPress}:{
 label:string;active?:boolean;onPress:()=>void;
}){
 return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{selected:active}}
  style={({pressed})=>({minHeight:43,paddingHorizontal:13,paddingVertical:7,
   backgroundColor:active?palette.forest:palette.surface,borderWidth:1,borderColor:active?palette.forest:palette.line,
   borderRadius:13,justifyContent:'center',opacity:pressed?.7:1})}>
  <Text style={{fontFamily:font.bold,fontSize:12,color:active?'white':palette.secondaryText}}>{label}</Text>
 </Pressable>;
}
export function Field({label,value,onChangeText,placeholder,...props}:TextInputProps&{
 label:string;value:string;onChangeText:(value:string)=>void;
}){
 return <View style={{gap:7}}>
   <Text style={{fontFamily:font.bold,fontSize:12,color:palette.ink}}>{label}</Text>
   <TextInput {...props} value={value} onChangeText={onChangeText} placeholder={placeholder}
     placeholderTextColor="#7F9380" style={[{minHeight:48,backgroundColor:'#FAFDF9',borderRadius:13,borderWidth:1,
      borderColor:palette.line,paddingHorizontal:14,paddingVertical:10,
      fontFamily:font.medium,color:palette.ink,fontSize:14},props.multiline?{minHeight:91,textAlignVertical:'top'}:null]}/>
  </View>;
}
export function StatusNote({text}:{text:string}){
 return <View style={{backgroundColor:'#EFF6E9',borderRadius:13,padding:12}}>
  <Text style={{fontFamily:font.medium,color:'#4E7158',fontSize:12,lineHeight:19}}>{text}</Text>
 </View>;
}
