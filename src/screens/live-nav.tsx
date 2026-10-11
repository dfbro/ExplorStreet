import {router,useLocalSearchParams} from 'expo-router';
import {useEffect} from 'react';
import {Text,View} from 'react-native';
import {AreaMap} from '@/components/area-map';
import {AppPage} from '@/components/app-page';
import {Action,Body,Panel,StatusNote} from '@/components/primitives';
import {useMapSelection} from '@/features/map/map-selection';
import {usePresetStore} from '@/features/map/preset-store';
import {font,palette} from '@/theme/tokens';

export function LiveNavScreen(){
 const {route:requested}=useLocalSearchParams<{route?:string}>();
 const {selection,ready,selectRoute,clearDestination}=useMapSelection();
 const {routes:storedRoutes,ready:presetsReady}=usePresetStore();
 const activeId=requested&&storedRoutes.some(r=>r.id===requested)?requested:selection.routeId;
 const selectedRoute=storedRoutes.find(r=>r.id===activeId);
 const selectedArea=selectedRoute?.area??selection.area;
 const destination=activeId?null:selection.destination;
 useEffect(()=>{
  if(requested&&presetsReady){
   const matching=storedRoutes.find(r=>r.id===requested);
   if(matching)selectRoute(matching.area,matching.id);
  }
 },[requested,presetsReady,storedRoutes,selectRoute]);
 return <AppPage title="Peta navigasi" subtitle="Pratinjau peta dari Home. Tidak ada simulasi perjalanan atau panduan belokan otomatis.">
  {!ready||!presetsReady?<StatusNote text="Memuat pilihan peta yang tersimpan..."/>:
  <>
   <Panel>
    <Text style={{fontFamily:font.display,color:palette.ink,fontSize:19}}>
     {selectedRoute?.title??(destination?'Titik tujuan pilihan':'Peta area '+selectedArea)}
    </Text>
    <Body>{selectedRoute
     ?'Garis rute yang disimpan ditampilkan di bawah. Ini adalah sketsa manual, belum disesuaikan dengan jalan.'
     :destination?'Titik yang dipilih dari Home ditampilkan pada peta. Belum ada garis rute menuju tujuan.'
     :'Pilih tujuan atau rute di Home untuk menampilkan pilihan tersebut di sini.'}</Body>
   </Panel>
   <AreaMap area={selectedArea} routeId={selectedRoute?.id??undefined}
    destination={destination} destinationMode={!!destination} height={390} compact/>
   {destination?<Panel>
    <Text style={{fontFamily:font.bold,color:palette.ink}}>Koordinat tujuan</Text>
    <Body>{destination.latitude.toFixed(5)}, {destination.longitude.toFixed(5)}</Body>
    <Action kind="outline" label="Hapus titik tujuan" onPress={clearDestination}/>
   </Panel>:null}
   <Action label="Pilih rute lain di Home" onPress={()=>router.push('/')}/>
   <StatusNote text="Peta merupakan referensi visual, bukan navigasi GPS aktif. Periksa akses dan kondisi jalan secara langsung sebelum bepergian."/>
  </>}
 </AppPage>;
}
