import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Stack} from 'expo-router';
import {ActivityIndicator,Pressable,ScrollView,Text,TextInput,View,useWindowDimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MapSurface} from '@/components/map-surface';
import {Check,Coffee,Info,MapPin,Plus,Route as RouteIcon,Store,Tag,X} from '@/components/icons';
import {getAreaCenter} from '@/features/map/areas';
import {buildExplorerDocument,type MapEditorEvent} from '@/features/map/explorer-document';
import {exportJsonFile} from '@/features/map/export-file';
import {
 estimateSketchKm,makeRouteJson,makeCheckpointJson,parseEditorJson,
 type GeoPoint,type CheckpointKind,type RouteActivity,type StoreCheckpoint,
} from '@/features/map/editor-json';
import {font,palette,radius} from '@/theme/tokens';

const AREAS=['Ijen','Kayutangan','Lowokwaru','Blimbing','Sukun'];
const storageKey='explorstreet.editor.v1';
const kindLabels:Record<CheckpointKind,string>={cafe:'Kafe',store:'Toko',rest:'Tempat rehat'};
type SavedDraft={id:string;title:string;area:string;activity:RouteActivity;
 points:GeoPoint[];checkpoints:StoreCheckpoint[]};
function Btn({label,onPress,filled=false,disabled=false}:{
 label:string;onPress:()=>void;filled?:boolean;disabled?:boolean;
}){
 return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
  style={({pressed})=>({minHeight:47,borderRadius:13,paddingHorizontal:14,
   backgroundColor:filled?palette.forest:palette.pale,justifyContent:'center',alignItems:'center',
   opacity:disabled?.5:pressed?.75:1})}>
  <Text style={{fontFamily:font.bold,fontSize:13,color:filled?palette.white:palette.forest}}>{label}</Text>
 </Pressable>;
}
function Choice({label,active,onPress}: {label:string;active:boolean;onPress:()=>void}){
 return <Pressable accessibilityRole="button" accessibilityState={{selected:active}} onPress={onPress}
  style={({pressed})=>({minHeight:42,borderRadius:12,paddingHorizontal:13,alignItems:'center',
   justifyContent:'center',borderWidth:1,borderColor:active?palette.forest:palette.line,
   backgroundColor:active?palette.forest:palette.surface,opacity:pressed?.75:1})}>
   <Text style={{color:active?'white':palette.ink,fontSize:12,fontFamily:font.bold}}>{label}</Text>
  </Pressable>;
}
function SectionTitle({children}:{children:string}){
 return <Text style={{fontFamily:font.display,fontSize:21,color:palette.ink}}>{children}</Text>;
}
function FormInput({label,value,onChangeText,placeholder,multiline=false}:{
 label:string;value:string;onChangeText:(value:string)=>void;placeholder?:string;multiline?:boolean;
}){
 return <View style={{gap:6}}>
  <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:12}}>{label}</Text>
  <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText}
   placeholder={placeholder} placeholderTextColor="#7A937F" multiline={multiline}
   textAlignVertical={multiline?'top':'center'}
   style={{minHeight:multiline?78:48,borderWidth:1.3,borderColor:palette.line,
    backgroundColor:'#FBFDF9',borderRadius:13,paddingHorizontal:13,
    paddingTop:multiline?11:0,fontFamily:font.medium,color:palette.ink,fontSize:14}}/>
 </View>;
}

export function RouteStudioScreen(){
 const {width}=useWindowDimensions();
 const [ready,setReady]=useState(false);
 const [routeId,setRouteId]=useState(()=>`draft-${Date.now()}`);
 const [title,setTitle]=useState('Rute buatanku');
 const [area,setArea]=useState('Ijen');
 const [activity,setActivity]=useState<RouteActivity>('run');
 const [points,setPoints]=useState<GeoPoint[]>([]);
 const [mapSeed,setMapSeed]=useState<{area:string;points:GeoPoint[];revision:number}>({
  area:'Ijen',points:[],revision:0,
 });
 const [checkpoints,setCheckpoints]=useState<StoreCheckpoint[]>([]);
 const [pendingPoint,setPendingPoint]=useState<GeoPoint|null>(null);
 const [storeName,setStoreName]=useState('');
 const [kind,setKind]=useState<CheckpointKind>('cafe');
 const [promoted,setPromoted]=useState(false);
 const [promoText,setPromoText]=useState('');
 const [notes,setNotes]=useState('');
 const [importOpen,setImportOpen]=useState(false);
 const [importText,setImportText]=useState('');
 const [feedback,setFeedback]=useState('');
 const [busy,setBusy]=useState(false);
 const scroller=useRef<ScrollView>(null);
 const formY=useRef(0);
 const onMap=useCallback((message:MapEditorEvent)=>{
  if(message.type==='explorstreet:sketch'){
   setPoints(message.coordinates);
   return;
  }
  if(message.type==='explorstreet:checkpoint-point'){
   setPendingPoint(message.coordinates);
   setFeedback('');
   setTimeout(()=>scroller.current?.scrollTo({y:Math.max(0,formY.current-15),animated:true}),210);
  }
 },[]);
 useEffect(()=>{
  let cancelled=false;
  AsyncStorage.getItem(storageKey).then(value=>{
   if(cancelled)return;
   if(value){
    const parsed=JSON.parse(value) as SavedDraft;
    const draftPoints=Array.isArray(parsed.points)&&parsed.points.length<=120
      ?parsed.points.filter(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n))
        &&p[0]>=-180&&p[0]<=180&&p[1]>=-90&&p[1]<=90):[];
    const checked=makeCheckpointJson(parsed.id,Array.isArray(parsed.checkpoints)?parsed.checkpoints:[]);
    setRouteId(parsed.id);setTitle(parsed.title);setArea(parsed.area);setActivity(parsed.activity);
    setPoints(draftPoints);setCheckpoints(checked.checkpoints);
    setMapSeed({area:parsed.area,points:draftPoints,revision:1});
   }
  }).catch(()=>setFeedback('Draf tersimpan tidak dapat dibaca; mulai dengan rute kosong.'))
  .finally(()=>{if(!cancelled)setReady(true);});
  return()=>{cancelled=true;};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  const data:SavedDraft={id:routeId,title,area,activity,points,checkpoints};
  AsyncStorage.setItem(storageKey,JSON.stringify(data))
   .catch(()=>setFeedback('Gagal menyimpan draf ke perangkat.'));
 },[ready,routeId,title,area,activity,points,checkpoints]);

 const center=getAreaCenter(mapSeed.area);
 const mapHtml=useMemo(()=>buildExplorerDocument({
  area:mapSeed.area,latitude:mapSeed.points.length?mapSeed.points[0][1]:center.latitude,
  longitude:mapSeed.points.length?mapSeed.points[0][0]:center.longitude,
  sketch:mapSeed.points.map(([lon,lat])=>[lat,lon]),showSketch:mapSeed.points.length>0,
  cafes:[],roadAligned:false,editorMode:true,editorCheckpoints:checkpoints,
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }),[mapSeed.revision,mapSeed.area]);
 const distanceKm=estimateSketchKm(points);
 const resetPlaceForm=()=>{
  setPendingPoint(null);setStoreName('');setKind('cafe');setPromoted(false);setPromoText('');setNotes('');
 };
 const addCheckpoint=()=>{
  if(!pendingPoint){setFeedback('Pilih titik checkpoint dahulu di peta.');return;}
  if(!storeName.trim()){setFeedback('Isi nama kafe, toko, atau tempat rehat.');return;}
  if(checkpoints.length>=50){setFeedback('Maksimal 50 checkpoint dalam satu rute.');return;}
  const item:StoreCheckpoint={
   id:`stop-${Date.now()}`,name:storeName.trim().slice(0,100),kind,coordinates:pendingPoint,
   promoted,promoText:promoted?promoText.trim().slice(0,300):'',notes:notes.trim().slice(0,400),
   verification:'unverified',
  };
  setCheckpoints(previous=>[...previous,item]);
  resetPlaceForm();setFeedback('Checkpoint tersimpan di draf dan akan ikut diekspor.');
 };
 const handleExport=async(type:'route'|'checkpoints')=>{
  if(type==='route'&&points.length<2){setFeedback('Buat minimal 2 titik sketsa sebelum ekspor rute.');return;}
  setBusy(true);setFeedback('');
  try{
   const data=type==='route'
    ?makeRouteJson({id:routeId,title:title.trim()||'Rute buatanku',area,activity,coordinates:points})
    :makeCheckpointJson(routeId,checkpoints);
   await exportJsonFile(`explorstreet-${type}-${routeId}.json`,data);
   setFeedback('JSON berhasil disiapkan untuk diunduh atau dibagikan.');
  }catch(error){
   setFeedback(error instanceof Error?error.message:'Ekspor JSON gagal.');
  }finally{setBusy(false);}
 };
 const handleImport=()=>{
  try{
   const doc=parseEditorJson(importText);
   if(doc.schema==='explorstreet.route'){
    setRouteId(doc.id);setTitle(doc.title);setArea(doc.area);setActivity(doc.activity);
    setPoints(doc.geometry.coordinates);setCheckpoints([]);resetPlaceForm();
    setMapSeed(prev=>({area:doc.area,points:doc.geometry.coordinates,revision:prev.revision+1}));
    setFeedback('Rute dimuat. Untuk checkpoint, impor dokumen checkpoint terkait.');
   }else{
    if(doc.routeId!==routeId)throw Error('routeId checkpoint tidak cocok dengan rute aktif.');
    setCheckpoints(doc.checkpoints);resetPlaceForm();
    setFeedback('Checkpoint diimpor. Data masih perlu diverifikasi.');
   }
   setImportText('');setImportOpen(false);
  }catch(error){setFeedback(error instanceof Error?error.message:'Impor JSON gagal.');}
 };
 const changeArea=(next:string)=>{
  if(next===area)return;
  if(points.length||checkpoints.length){
   setFeedback('Pilih area lain hanya setelah mengosongkan draf atau mengimpor rute baru.');
   return;
  }
  setArea(next);setMapSeed(prev=>({area:next,points:[],revision:prev.revision+1}));
 };
 return <>
  <Stack.Screen options={{title:'Studio Rute'}}/>
  <ScrollView ref={scroller} keyboardShouldPersistTaps="handled"
   style={{flex:1,backgroundColor:palette.background}}
   contentContainerStyle={{maxWidth:850,width:'100%',alignSelf:'center',padding:16,
    paddingBottom:65,gap:17}}>
   <View style={{gap:6}}>
    <Text style={{fontFamily:font.extra,color:palette.forest,fontSize:width<350?27:32}}>Studio Rute</Text>
    <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:13,lineHeight:20}}>
     Gambar jalur, ukur estimasinya, lalu tandai pit-stop. Draf tersimpan di perangkat.
    </Text>
   </View>
   <View style={{backgroundColor:palette.surface,borderRadius:radius.large,
    padding:15,gap:13,borderWidth:1,borderColor:palette.line}}>
    <FormInput label="Nama rute" value={title} onChangeText={setTitle} placeholder="Contoh: Ijen sore"/>
    <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:12}}>Aktivitas</Text>
    <View style={{flexDirection:'row',gap:8}}>
     <Choice label="Lari" active={activity==='run'} onPress={()=>setActivity('run')}/>
     <Choice label="Gowes" active={activity==='bike'} onPress={()=>setActivity('bike')}/>
    </View>
    <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:12}}>Area peta</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:7}}>
     {AREAS.map(name=><Choice key={name} label={name} active={area===name} onPress={()=>changeArea(name)}/>)}
    </View>
   </View>
   <View style={{backgroundColor:palette.forest,padding:17,borderRadius:radius.large,
    flexDirection:'row',alignItems:'center',gap:13}}>
    <View style={{width:48,height:48,borderRadius:14,alignItems:'center',
     justifyContent:'center',backgroundColor:'#326E53'}}>
     <RouteIcon size={25} color={palette.white}/>
    </View>
    <View style={{flex:1,gap:3}}>
     <Text style={{fontFamily:font.semi,color:'#D8F0D6',fontSize:12}}>Estimasi jarak sketsa</Text>
     <Text testID="estimate-distance" style={{fontFamily:font.extra,fontSize:29,color:palette.white}}>
      {distanceKm.toFixed(2)} km
     </Text>
    </View>
    <Text style={{fontFamily:font.bold,color:palette.white,fontSize:12}}>{points.length} titik</Text>
   </View>
   <View style={{gap:10}}>
    <SectionTitle>Gambar di peta</SectionTitle>
    {ready?<MapSurface key={mapSeed.revision} html={mapHtml} area={area} height={350}
      onEditorEvent={onMap} checkpoints={checkpoints}/>:
     <View style={{height:350,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></View>}
    <View style={{flexDirection:'row',gap:7,alignItems:'flex-start'}}>
     <Info size={17} color={palette.pine}/>
     <Text style={{flex:1,fontFamily:font.medium,fontSize:12,lineHeight:19,color:palette.secondaryText}}>
      Ketuk peta saat menggambar. Garis penghubung antar-titik bukan jalur mengikuti jalan; panjang jalan nyata bisa berbeda.
     </Text>
    </View>
   </View>
   <View onLayout={e=>{formY.current=e.nativeEvent.layout.y;}}
    style={{padding:16,gap:12,backgroundColor:palette.surface,borderRadius:radius.large,
     borderWidth:1,borderColor:palette.line}}>
    <View style={{flexDirection:'row',gap:8,alignItems:'center'}}>
     <MapPin size={21} color={palette.pine}/>
     <View style={{flex:1}}><SectionTitle>Checkpoint & toko</SectionTitle></View>
    </View>
    <Text style={{fontFamily:font.medium,fontSize:12,lineHeight:19,color:palette.secondaryText}}>
     Tekan Tandai checkpoint di peta, kemudian ketuk lokasinya untuk mengisi detail.
    </Text>
    {pendingPoint?<View style={{gap:11,backgroundColor:'#F4F8F0',padding:12,borderRadius:14}}>
       <Text style={{fontFamily:font.bold,color:palette.forest,fontSize:13}}>
        Titik dipilih: {pendingPoint[1].toFixed(5)}, {pendingPoint[0].toFixed(5)}
       </Text>
       <FormInput label="Nama tempat" value={storeName} onChangeText={setStoreName}
        placeholder="Nama kafe/toko/tempat rehat"/>
       <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:12}}>Kategori</Text>
       <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}}>
        {(['cafe','store','rest'] as CheckpointKind[]).map(k=>
          <Choice key={k} label={kindLabels[k]} active={kind===k} onPress={()=>setKind(k)}/>)}
       </View>
       <Pressable accessibilityRole="checkbox" accessibilityState={{checked:promoted}}
        onPress={()=>setPromoted(v=>!v)}
        style={{minHeight:45,flexDirection:'row',gap:10,alignItems:'center'}}>
        <View style={{width:23,height:23,borderRadius:7,borderWidth:1.5,
         borderColor:palette.forest,backgroundColor:promoted?palette.forest:'white',
         justifyContent:'center',alignItems:'center'}}>{promoted?<Check size={18} color="white"/>:null}</View>
        <Text style={{fontFamily:font.bold,color:palette.forest,flex:1}}>Tandai sebagai promosi (draft)</Text>
       </Pressable>
       {promoted?<FormInput label="Deskripsi promosi (belum diverifikasi)"
        value={promoText} onChangeText={setPromoText} placeholder="Contoh: penawaran mitra"/>:null}
       <FormInput label="Catatan opsional" value={notes} onChangeText={setNotes}
        placeholder="Fasilitas atau titik istirahat" multiline/>
       <View style={{flexDirection:'row',gap:8}}>
        <View style={{flex:1}}><Btn label="Simpan checkpoint" filled onPress={addCheckpoint}/></View>
        <Btn label="Batal" onPress={resetPlaceForm}/>
       </View>
      </View>:null}
    {checkpoints.length===0?<View style={{paddingVertical:9}}>
      <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:12}}>Belum ada checkpoint ditambahkan.</Text>
     </View>:checkpoints.map(item=><View key={item.id}
       style={{flexDirection:'row',alignItems:'center',gap:10,borderTopWidth:1,
        borderColor:palette.line,paddingTop:13}}>
       {item.kind==='cafe'?<Coffee size={20} color={palette.pine}/>:
        item.kind==='store'?<Store size={20} color={palette.pine}/>:<MapPin size={20} color={palette.pine}/>}
       <View style={{flex:1,gap:3}}>
        <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:13}}>{item.name}</Text>
        <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:11}}>
         {kindLabels[item.kind]}{item.promoted?' • Promosi draft':''}
        </Text>
       </View>
       <Pressable accessibilityRole="button" accessibilityLabel={`Hapus checkpoint ${item.name}`}
        onPress={()=>setCheckpoints(prev=>prev.filter(p=>p.id!==item.id))}
        style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}>
        <X size={20} color={palette.pine}/>
       </Pressable>
      </View>)}
   </View>
   <View style={{backgroundColor:palette.surface,padding:16,gap:12,
    borderRadius:radius.large,borderWidth:1,borderColor:palette.line}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
      <Tag size={19} color={palette.pine}/><SectionTitle>Ekspor JSON</SectionTitle>
    </View>
    <Text style={{fontFamily:font.medium,fontSize:12,lineHeight:19,color:palette.secondaryText}}>
     Dua file independen dengan routeId yang sama. JSON promosi hanya menandai draf, bukan kerja sama bisnis aktif.
    </Text>
    <View style={{gap:9}}>
     <Btn label="Ekspor rute (.json)" onPress={()=>void handleExport('route')} filled disabled={busy}/>
     <Btn label={`Ekspor checkpoint (.json) — ${checkpoints.length}`} onPress={()=>void handleExport('checkpoints')} disabled={busy}/>
    </View>
    {busy?<ActivityIndicator color={palette.pine}/>:null}
   </View>
   <View style={{backgroundColor:palette.surface,borderRadius:radius.large,
    padding:15,gap:12,borderWidth:1,borderColor:palette.line}}>
    <Pressable accessibilityRole="button" onPress={()=>setImportOpen(v=>!v)}
     style={{minHeight:42,flexDirection:'row',alignItems:'center',gap:9}}>
      <Plus size={19} color={palette.pine}/>
      <Text style={{fontFamily:font.bold,color:palette.forest,flex:1}}>Import JSON untuk diedit</Text>
      <Text style={{fontFamily:font.semi,color:palette.pine}}>{importOpen?'Tutup':'Buka'}</Text>
    </Pressable>
    {importOpen?<View style={{gap:10}}>
     <FormInput label="Tempel konten JSON" value={importText} onChangeText={setImportText}
      multiline placeholder='{"schema":"explorstreet.route",...}'/>
     <Btn filled label="Validasi dan impor" onPress={handleImport}/>
    </View>:null}
   </View>
   {feedback?<View style={{padding:13,backgroundColor:palette.pale,borderRadius:13,
    flexDirection:'row',alignItems:'flex-start',gap:9}}>
    <Info size={18} color={palette.forest}/>
    <Text style={{flex:1,fontFamily:font.medium,color:palette.forest,fontSize:12,lineHeight:19}}>{feedback}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Tutup pesan" onPress={()=>setFeedback('')}>
      <X size={17} color={palette.forest}/>
    </Pressable>
   </View>:null}
   <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:11,lineHeight:18}}>
    Jangan tandai tempat pribadi atau rumah orang sebagai checkpoint publik. Pastikan informasi tempat/promosi diverifikasi sebelum diterbitkan.
   </Text>
  </ScrollView>
 </>;
}
