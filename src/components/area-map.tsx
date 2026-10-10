import {useMemo} from 'react';
import {ActivityIndicator,Linking,Pressable,Text,View} from 'react-native';
import {Coffee,ExternalLink,Info,MapPin} from '@/components/icons';
import {MapSurface} from '@/components/map-surface';
import {getAreaCenter,osmUrl} from '@/features/map/areas';
import {buildExplorerDocument} from '@/features/map/explorer-document';
import {demoSketch} from '@/features/map/route-sketch';
import {useCafeSearch} from '@/features/map/use-cafe-search';
import {font,palette} from '@/theme/tokens';

export function AreaMap({area,height=300,routeId,compact=false}:{
 area:string;height?:number;routeId?:string;compact?:boolean;
}){
 const {latitude,longitude}=getAreaCenter(area);
 const {lookup,load}=useCafeSearch(area);
 const html=useMemo(()=>buildExplorerDocument({
  area,latitude,longitude,sketch:routeId?demoSketch(area,routeId).points:[],
  cafes:lookup.cafes,showSketch:!!routeId,
 }),[area,latitude,longitude,routeId,lookup.cafes]);
 return <View style={{gap:11}}>
   <MapSurface html={html} height={height} area={area}/>
   <View style={{flexDirection:'row',alignItems:'flex-start',gap:8}}>
     <Info size={17} color={palette.pine}/>
     <Text style={{flex:1,fontFamily:font.medium,fontSize:12,lineHeight:19,color:palette.secondaryText}}>
       {routeId
        ?'Garis jingga adalah sketsa contoh. Ketuk “Gambar sketsa” untuk menyusun titik sendiri; garis tidak mengikuti jalan.'
        :'Peta jalan interaktif dengan pusat area perkiraan. Ketuk “Gambar sketsa” untuk membuat garis konsep.'}
     </Text>
   </View>
   <View style={{flexDirection:'row',gap:9,alignItems:'center',flexWrap:'wrap'}}>
     <Pressable accessibilityRole="button" onPress={()=>void load()} disabled={lookup.status==='loading'}
       style={({pressed})=>({backgroundColor:palette.pale,paddingHorizontal:13,minHeight:45,
       borderRadius:13,flexDirection:'row',alignItems:'center',justifyContent:'center',
       gap:8,opacity:pressed?.7:lookup.status==='loading'?.65:1})}>
       {lookup.status==='loading'?<ActivityIndicator color={palette.forest} size="small"/>:<Coffee size={18} color={palette.forest}/>}
       <Text style={{color:palette.forest,fontFamily:font.bold,fontSize:12}}>
         {lookup.status==='loading'?'Mencari kafe...':lookup.status==='ready'?'Perbarui kafe':'Cari kafe OSM'}
       </Text>
     </Pressable>
     <Pressable accessibilityRole="link" onPress={()=>void Linking.openURL(osmUrl(area))}
       style={{minHeight:44,flexDirection:'row',gap:5,alignItems:'center'}}>
       <ExternalLink size={16} color={palette.pine}/>
       <Text style={{color:palette.pine,fontFamily:font.bold,fontSize:12}}>Peta penuh</Text>
     </Pressable>
   </View>
   {lookup.status==='error'?<Text style={{fontFamily:font.medium,color:palette.danger,fontSize:12,lineHeight:19}}>
      {lookup.message}
    </Text>:null}
   {lookup.status==='ready'?<View style={{gap:9}}>
     <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:12,lineHeight:18}}>
       {lookup.cafes.length
        ?lookup.cafes.length+' titik kafe OSM ditemukan di sekitar area '+area+'. Bukan jaminan berada tepat di sepanjang sketsa.'
        :'Belum ada kafe bernama dalam data OSM yang dikembalikan untuk area ini.'}
       {lookup.fromCache?' Data tersimpan sementara.':''}
     </Text>
     {lookup.cafes.slice(0,compact?3:6).map(cafe=><Pressable key={cafe.id}
       accessibilityRole="link" onPress={()=>void Linking.openURL(cafe.osmUrl)}
       style={({pressed})=>({minHeight:48,borderRadius:13,borderWidth:1,
       backgroundColor:palette.surface,borderColor:palette.line,flexDirection:'row',
       alignItems:'center',paddingHorizontal:12,gap:9,opacity:pressed?.7:1})}>
       <MapPin size={18} color={palette.pine}/>
       <View style={{flex:1,gap:3}}>
        <Text numberOfLines={1} style={{fontFamily:font.bold,fontSize:13,color:palette.ink}}>{cafe.name}</Text>
        {cafe.address?<Text numberOfLines={1} style={{fontFamily:font.medium,fontSize:11,color:palette.secondaryText}}>
          {cafe.address}</Text>:null}
       </View>
       <ExternalLink size={16} color={palette.pine}/>
     </Pressable>)}
     {lookup.cafes.length>(compact?3:6)?<Text style={{fontFamily:font.medium,fontSize:12,color:palette.secondaryText}}>
       Marker lain dapat dilihat langsung pada peta.</Text>:null}
     <Text style={{fontFamily:font.medium,fontSize:11,lineHeight:18,color:palette.secondaryText}}>
       Status buka, akses pejalan kaki, dan fasilitas kafe belum diverifikasi langsung.
     </Text>
   </View>:null}
 </View>;
}
