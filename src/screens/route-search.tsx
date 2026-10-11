import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Keyboard,Pressable,ScrollView,Text,TextInput,View,useWindowDimensions} from 'react-native';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {AreaMap} from '@/components/area-map';
import {AppHeader,AppNav} from '@/components/app-nav';
import {RouteCard} from '@/components/route-card';
import {Bike,BookmarkCheck,Check,ChevronRight,Footprints,Info,MapPin,Plus,Search,SlidersHorizontal,X} from '@/components/icons';
import {parseCustomDistance} from '@/features/routes/custom-distance';
import {DEFAULT_FILTERS,PRIORITY_TEXT,type DistanceBand,type Priority,type RouteInfo} from '@/features/routes/model';
import {useRoutePreferences} from '@/features/routes/preferences';
import {rankRoutes} from '@/features/routes/ranking';
import {routeRepository} from '@/features/routes/repository';
import {usePresetStore} from '@/features/map/preset-store';
import {useMapSelection} from '@/features/map/map-selection';
import {font,palette,radius} from '@/theme/tokens';

const AREAS=['Ijen','Kayutangan','Lowokwaru','Blimbing','Sukun'];
const BANDS:{id:DistanceBand;label:string}[]=[
 {id:'all',label:'Semua'}, {id:'short',label:'2–4 km'},
 {id:'medium',label:'4–7 km'}, {id:'long',label:'>7 km'},
];
const MOODS=[{key:'quiet' as const,label:'Jalan lebih tenang'},
 {key:'flat' as const,label:'Sedikit tanjakan'},
 {key:'stops' as const,label:'Tempat singgah'}];

function Selection({label,active,onPress}: {label:string;active:boolean;onPress:()=>void}){
 return <Pressable accessibilityRole="button" accessibilityState={{selected:active}}
  onPress={onPress} style={({pressed})=>({
   minHeight:43,paddingHorizontal:14,borderRadius:13,borderWidth:1,
   borderColor:active?palette.forest:palette.line,
   backgroundColor:active?palette.forest:palette.surface,alignItems:'center',justifyContent:'center',
   opacity:pressed?.75:1,
  })}>
  <Text style={{color:active?'white':palette.ink,fontFamily:font.bold,fontSize:12}}>{label}</Text>
 </Pressable>;
}

function LevelPicker({title,value,onChange}:{
 title:string;value:Priority;onChange:(level:Priority)=>void;
}){
 return <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',
   gap:10,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#EDF2E9'}}>
   <View style={{flex:1,gap:3}}>
    <Text style={{fontFamily:font.semi,color:palette.ink,fontSize:13}}>{title}</Text>
    <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:11}}>{PRIORITY_TEXT[value]}</Text>
   </View>
   <View style={{flexDirection:'row',gap:5}}>
    {([0,1,2,3] as Priority[]).map(level=>
     <Pressable key={level} accessibilityRole="button" accessibilityLabel={`${title} tingkat ${level}`}
      accessibilityState={{selected:level===value}}
      onPress={()=>onChange(level)}
      style={{width:37,height:39,borderRadius:11,backgroundColor:level===value?palette.forest:palette.pale,
       alignItems:'center',justifyContent:'center'}}>
       <Text style={{fontFamily:font.bold,fontSize:12,color:level===value?'white':palette.forest}}>{level}</Text>
     </Pressable>)}
   </View>
  </View>;
}

export function RouteSearchScreen(){
 const {routes:storedRoutes,ready:presetsReady}=usePresetStore();
 const {selection:mapSelection,selectArea,selectDestination,clearDestination,error:mapError}=useMapSelection();
 const {width,height}=useWindowDimensions();
 const insets=useSafeAreaInsets();
 const pageRef=useRef<ScrollView>(null);
 const searchRef=useRef<TextInput>(null);
 const resultsTop=useRef(0);
 const pendingScroll=useRef(false);
 const scrollTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const searchFocused=useRef(false);
 const [isSearchFocused,setIsSearchFocused]=useState(false);
 const {filters,favorites,ready,saveError,clearSaveError,setSport,setDistance,
  setCustomDistance,setArea,setQuery,setSavedOnly,setWeight,toggleFavorite}=useRoutePreferences();
 const [catalog,setCatalog]=useState<readonly RouteInfo[]>([]);
 const [loadState,setLoadState]=useState<'loading'|'ready'|'error'>('loading');
 const [advanced,setAdvanced]=useState(false);
 const [minInput,setMinInput]=useState(filters.minKm?.toString()??'');
 const [maxInput,setMaxInput]=useState(filters.maxKm?.toString()??'');
 const [distanceError,setDistanceError]=useState('');
 const [reload,setReload]=useState(0);

 useEffect(()=>{
  let active=true;
  if(!presetsReady)return;
  routeRepository.list(storedRoutes).then(routes=>{if(active){setCatalog(routes);setLoadState('ready');}})
   .catch(()=>{if(active)setLoadState('error');});
  return()=>{active=false;};
 },[reload,storedRoutes,presetsReady]);

 const results=useMemo(()=>rankRoutes(catalog,filters,favorites),[catalog,filters,favorites]);
 const area=filters.area??'Ijen';
 const destination=mapSelection.area===area&&!mapSelection.routeId?mapSelection.destination:null;
 const ownRoutes=useMemo(()=>catalog.filter(route=>route.id.startsWith('user-')),[catalog]);
 const hasQuery=filters.query.trim().length>0;
 const recommendTitle=filters.savedOnly?'Rute tersimpan':hasQuery?'Hasil pencarian':'Rekomendasi rute';
 const onDestination=useCallback((point:{latitude:number;longitude:number})=>selectDestination(area,point),[area,selectDestination]);

 const scrollToResults=useCallback(()=>{
  if(scrollTimer.current)clearTimeout(scrollTimer.current);
  scrollTimer.current=null;
  if(!pendingScroll.current)return;
  pendingScroll.current=false;
  pageRef.current?.scrollTo({y:Math.max(0,resultsTop.current-14),animated:true});
 },[]);
 const queueResultScroll=useCallback(()=>{
  if(!filters.query.trim())return;
  pendingScroll.current=true;
  if(scrollTimer.current)clearTimeout(scrollTimer.current);
  // Fallback for web, hardware keyboards, or a keyboard that was not displayed.
  scrollTimer.current=setTimeout(scrollToResults,360);
 },[filters.query,scrollToResults]);

 useEffect(()=>{
  const subscription=Keyboard.addListener('keyboardDidHide',()=>{
   if(searchFocused.current){
    searchRef.current?.blur();
    queueResultScroll();
   }
   if(pendingScroll.current)scrollToResults();
  });
  return()=>{
   subscription.remove();
  };
 },[queueResultScroll,scrollToResults]);
 useEffect(()=>()=>{if(scrollTimer.current)clearTimeout(scrollTimer.current);},[]);

 const applyDistance=()=>{
  const parsed=parseCustomDistance(minInput,maxInput);
  if(!parsed.ok){setDistanceError(parsed.error);return;}
  setCustomDistance(parsed.minKm,parsed.maxKm);
  setDistanceError('');
 };
 const resetFilters=()=>{
  setSport('run');setArea(null);setDistance('all');setSavedOnly(false);setQuery('');
  setMinInput('');setMaxInput('');setDistanceError('');
  for(const key of ['quiet','flat','stops'] as const)setWeight(key,DEFAULT_FILTERS.weights[key]);
  selectArea('Ijen');
 };

 return <SafeAreaView edges={['top']} style={{flex:1,backgroundColor:palette.background}}>
  <ScrollView ref={pageRef} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic"
   contentContainerStyle={{maxWidth:900,width:'100%',alignSelf:'center',paddingHorizontal:16,
    paddingTop:13,
    // Keep enough trailing space to lift even a single search result above the bottom tabs.
    paddingBottom:hasQuery?Math.max(380,height*.55)+insets.bottom:92+insets.bottom,gap:15}}>
   <AppHeader/>
   <View style={{gap:4,paddingTop:6}}>
    <Text style={{fontFamily:font.extra,color:palette.ink,fontSize:width<350?25:29,letterSpacing:-.7}}>
     Mau jalan ke mana?
    </Text>
    <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:13,lineHeight:19}}>
     Jelajahi rute lari dan gowes di Kota Malang.
    </Text>
   </View>
   <View style={{flexDirection:'row',alignItems:'center',gap:11,
     backgroundColor:isSearchFocused?palette.forest:palette.surface,
     minHeight:55,borderRadius:17,borderWidth:1.5,
     borderColor:isSearchFocused?palette.pine:'#D6E7D7',paddingHorizontal:14}}>
    <Search size={22} color={isSearchFocused?palette.white:palette.pine}/>
    <TextInput
     ref={searchRef}
     accessibilityLabel="Cari rute atau area"
     value={filters.query}
     onChangeText={setQuery}
     placeholder="Cari rute atau area..."
     placeholderTextColor={isSearchFocused?'#D6E9D9':'#718B78'}
     returnKeyType="search"
     onFocus={()=>{searchFocused.current=true;setIsSearchFocused(true);}}
     onBlur={()=>{
      searchFocused.current=false;
      setIsSearchFocused(false);
      queueResultScroll();
     }}
     onSubmitEditing={()=>{
      queueResultScroll();
      Keyboard.dismiss();
      searchRef.current?.blur();
     }}
     style={{flex:1,minHeight:50,fontFamily:font.medium,
      backgroundColor:'transparent',color:isSearchFocused?palette.white:palette.ink,fontSize:15,
      outlineStyle:'solid',outlineWidth:0,outlineColor:'transparent'}}
    />
    {filters.query?<Pressable onPress={()=>setQuery('')} accessibilityRole="button"
      accessibilityLabel="Hapus pencarian" style={{minWidth:42,minHeight:42,alignItems:'center',justifyContent:'center'}}>
       <X size={19} color={isSearchFocused?palette.white:palette.pine}/>
     </Pressable>:null}
   </View>

   <View style={{backgroundColor:palette.surface,borderRadius:radius.large,borderWidth:1,
    borderColor:palette.line,padding:11,gap:11}}>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:3}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:7}}>
      <MapPin size={18} color={palette.pine}/>
      <Text style={{fontFamily:font.display,fontSize:17,color:palette.ink}}>Peta & tujuan</Text>
     </View>
     <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:11}}>OpenStreetMap</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:7,paddingBottom:1}}>
     {AREAS.map(name=><Selection key={name} label={name} active={area===name}
       onPress={()=>{setArea(name);selectArea(name);}}/>)}
    </ScrollView>
    <AreaMap area={area} height={235} destinationMode destination={destination}
     onDestination={onDestination} compact/>
    {destination?<View style={{backgroundColor:palette.pale,padding:12,borderRadius:12,
      flexDirection:'row',alignItems:'center',gap:9}}>
       <Check size={17} color={palette.forest}/>
       <Text style={{flex:1,fontFamily:font.medium,fontSize:12,color:palette.forest,lineHeight:18}}>
        Titik tujuan dipilih. Tampilkan peta yang sama di tab Navigasi.
       </Text>
       <Pressable accessibilityRole="button" accessibilityLabel="Hapus titik tujuan"
        onPress={clearDestination} style={{minWidth:40,minHeight:40,alignItems:'center',justifyContent:'center'}}>
        <X size={18} color={palette.forest}/>
       </Pressable>
     </View>:
     <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:12,lineHeight:18,
      paddingHorizontal:3}}>
      Pilih area, lalu tekan <Text style={{fontFamily:font.bold}}>Pilih tujuan</Text> di peta untuk menandai titik akhir.
     </Text>}
    {destination?<Pressable accessibilityRole="button" onPress={()=>router.push('/nav')}
      style={({pressed})=>({minHeight:46,backgroundColor:palette.forest,
       borderRadius:12,alignItems:'center',justifyContent:'center',opacity:pressed?.76:1})}>
      <Text style={{fontFamily:font.bold,color:palette.white,fontSize:13}}>Lihat titik ini di Navigasi</Text>
     </Pressable>:null}
   </View>

   <Pressable accessibilityRole="button" accessibilityState={{selected:filters.savedOnly}}
    onPress={()=>setSavedOnly(!filters.savedOnly)}
    style={({pressed})=>({minHeight:51,flexDirection:'row',alignItems:'center',gap:10,
      borderRadius:16,backgroundColor:filters.savedOnly?palette.pale:palette.surface,
      borderWidth:1,borderColor:filters.savedOnly?'#ACD2A3':palette.line,
      paddingHorizontal:15,opacity:pressed?.7:1})}>
    <BookmarkCheck size={22} color={palette.forest}/>
    <Text style={{fontFamily:font.bold,fontSize:14,color:palette.ink,flex:1}}>Bookmark rute</Text>
    <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:12}}>
     {favorites.size} tersimpan
    </Text>
    {filters.savedOnly?<Check size={17} color={palette.forest}/>:<ChevronRight size={18} color={palette.pine}/>}
   </Pressable>

   <Pressable accessibilityRole="button" onPress={()=>router.push('/studio')}
    style={({pressed})=>({minHeight:49,borderRadius:14,backgroundColor:palette.pale,
     paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:9,opacity:pressed?.75:1})}>
     <Plus size={21} color={palette.forest}/>
     <Text style={{fontFamily:font.bold,color:palette.forest,fontSize:13,flex:1}}>
      Buat dan simpan rute sendiri
     </Text>
     <ChevronRight size={19} color={palette.pine}/>
   </Pressable>

   {ownRoutes.length>0?<View style={{gap:11}}>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}>
     <Text style={{fontFamily:font.display,color:palette.ink,fontSize:20}}>Rute buatanku</Text>
     <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:12}}>{ownRoutes.length} lokal</Text>
    </View>
    {ownRoutes.map(route=><RouteCard key={route.id} route={route}
     saved={favorites.has(route.id)} onToggleSave={()=>toggleFavorite(route.id)}/>)}
   </View>:null}
   {mapError?<Text style={{fontFamily:font.medium,fontSize:12,color:palette.danger}}>{mapError}</Text>:null}

   <View style={{borderRadius:17,borderWidth:1,borderColor:palette.line,backgroundColor:palette.surface,
      overflow:'hidden'}}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:advanced}}
      onPress={()=>setAdvanced(value=>!value)}
      style={({pressed})=>({minHeight:56,paddingHorizontal:17,alignItems:'center',
       flexDirection:'row',gap:10,opacity:pressed?.75:1})}>
     <SlidersHorizontal size={22} color={palette.pine}/>
     <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:14,flex:1}}>
      Advanced filter
     </Text>
     <Text style={{fontFamily:font.semi,color:palette.pine,fontSize:12}}>
      {advanced?'Tutup':'Buka'}
     </Text>
     <ChevronRight size={18} color={palette.pine}
       style={{transform:[{rotate:advanced?'90deg':'0deg'}]}}/>
    </Pressable>
    {advanced?<View style={{paddingHorizontal:16,paddingBottom:18,gap:16}}>
      <View style={{height:1,backgroundColor:palette.line}}/>
      <View style={{gap:9}}>
       <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:13}}>Jenis aktivitas</Text>
       <View style={{flexDirection:'row',gap:8}}>
        <Pressable onPress={()=>setSport('run')} accessibilityRole="button"
         accessibilityState={{selected:filters.sport==='run'}} style={{flex:1}}>
         <View style={{minHeight:46,backgroundColor:filters.sport==='run'?palette.forest:palette.pale,
          borderRadius:12,flexDirection:'row',gap:8,justifyContent:'center',alignItems:'center'}}>
          <Footprints size={18} color={filters.sport==='run'?'white':palette.forest}/>
          <Text style={{fontFamily:font.bold,color:filters.sport==='run'?'white':palette.forest}}>Lari</Text>
         </View>
        </Pressable>
        <Pressable onPress={()=>setSport('bike')} accessibilityRole="button"
         accessibilityState={{selected:filters.sport==='bike'}} style={{flex:1}}>
         <View style={{minHeight:46,backgroundColor:filters.sport==='bike'?palette.forest:palette.pale,
          borderRadius:12,flexDirection:'row',gap:8,justifyContent:'center',alignItems:'center'}}>
          <Bike size={18} color={filters.sport==='bike'?'white':palette.forest}/>
          <Text style={{fontFamily:font.bold,color:filters.sport==='bike'?'white':palette.forest}}>Gowes</Text>
         </View>
        </Pressable>
       </View>
      </View>
      <View style={{gap:9}}>
       <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:13}}>Panjang rute</Text>
       <View style={{flexDirection:'row',flexWrap:'wrap',gap:7}}>
        {BANDS.map(b=><Selection key={b.id} label={b.label}
         active={filters.distance===b.id} onPress={()=>{setDistance(b.id);setDistanceError('');}}/>)}
       </View>
       <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:12}}>
        Atau tentukan jarak sendiri
       </Text>
       <View style={{flexDirection:'row',gap:8,alignItems:'flex-end'}}>
        {([{label:'Minimum (km)',value:minInput,onChange:setMinInput,hint:'Contoh: 3'},
           {label:'Maksimum (km)',value:maxInput,onChange:setMaxInput,hint:'Contoh: 8'}] as const).map(field=>
         <View key={field.label} style={{flex:1,minWidth:0,gap:6}}>
          <Text style={{fontFamily:font.semi,fontSize:11,color:palette.secondaryText}}>{field.label}</Text>
          <TextInput accessibilityLabel={field.label} keyboardType="decimal-pad" inputMode="decimal"
           value={field.value} onChangeText={field.onChange}
           placeholder={field.hint} placeholderTextColor="#78927C"
           style={{borderRadius:12,borderWidth:1,borderColor:palette.line,minHeight:46,
            fontFamily:font.medium,fontSize:14,color:palette.ink,paddingHorizontal:11,
            backgroundColor:'#FAFCF8'}}/>
         </View>)}
       </View>
       <Pressable accessibilityRole="button" onPress={applyDistance}
         style={({pressed})=>({backgroundColor:palette.pale,borderRadius:12,minHeight:45,
         justifyContent:'center',alignItems:'center',opacity:pressed?.7:1})}>
        <Text style={{fontFamily:font.bold,color:palette.forest,fontSize:13}}>
         Terapkan jarak kustom
        </Text>
       </Pressable>
       {distanceError?<Text style={{fontFamily:font.medium,color:palette.danger,fontSize:12}}>{distanceError}</Text>:null}
       {filters.distance==='custom'?<Text style={{fontFamily:font.bold,color:palette.pine,fontSize:12}}>
        Aktif: {filters.minKm??'0'}–{filters.maxKm??'100'} km
       </Text>:null}
      </View>
      <View style={{gap:5}}>
       <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:13}}>Prioritas rute</Text>
       {MOODS.map(item=><LevelPicker key={item.key} title={item.label}
        value={filters.weights[item.key]} onChange={value=>setWeight(item.key,value)}/>)}
      </View>
      <Pressable onPress={resetFilters} accessibilityRole="button" style={({pressed})=>({
       minHeight:45,borderWidth:1,borderColor:palette.line,borderRadius:12,
       justifyContent:'center',alignItems:'center',opacity:pressed?.7:1})}>
       <Text style={{fontFamily:font.bold,color:palette.pine,fontSize:13}}>Reset filter</Text>
      </Pressable>
     </View>:null}
   </View>

   {saveError?<Pressable onPress={clearSaveError} accessibilityRole="button"
    style={{backgroundColor:'#FFF0E9',borderRadius:12,padding:12,flexDirection:'row',gap:8}}>
      <Info size={17} color={palette.danger}/>
      <Text style={{fontFamily:font.medium,color:palette.danger,flex:1,fontSize:12}}>{saveError}</Text>
      <X size={17} color={palette.danger}/>
    </Pressable>:null}

   <View onLayout={event=>{resultsTop.current=event.nativeEvent.layout.y;}}
    style={{gap:13,marginTop:3}}>
    <View style={{gap:4}}>
     <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}>
      <Text style={{fontFamily:font.display,color:palette.ink,fontSize:width<350?20:23,flex:1}}>{recommendTitle}</Text>
      <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:12}}>
       {results.length} rute
      </Text>
     </View>
     {!hasQuery&&!filters.savedOnly?
      <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:12,lineHeight:18}}>
       Berdasarkan preferensi dan area pilihan. Bukan lokasi GPS.
      </Text>:null}
    </View>
    {loadState==='loading'||!ready?<View style={{padding:24,alignItems:'center',gap:9}}>
      <ActivityIndicator color={palette.pine}/>
      <Text style={{fontFamily:font.medium,color:palette.secondaryText}}>Menyiapkan rute...</Text>
     </View>:loadState==='error'?<View style={{padding:17,backgroundColor:palette.surface,borderRadius:16,gap:11}}>
       <Text style={{fontFamily:font.medium,color:palette.ink}}>Katalog belum tersedia.</Text>
       <Pressable accessibilityRole="button" onPress={()=>{setLoadState('loading');setReload(v=>v+1);}}>
        <Text style={{fontFamily:font.bold,color:palette.pine}}>Coba lagi</Text>
       </Pressable>
     </View>:results.length===0?<View style={{padding:19,backgroundColor:palette.surface,
       borderRadius:16,gap:9}}>
       <Text style={{fontFamily:font.display,color:palette.ink,fontSize:17}}>Belum ada rute yang cocok</Text>
       <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:12,lineHeight:19}}>
        Katalog alpha masih terbatas. Ubah nama, aktivitas atau jarak untuk mencoba lagi.
       </Text>
       <Pressable accessibilityRole="button" onPress={resetFilters} style={{minHeight:43,justifyContent:'center'}}>
        <Text style={{fontFamily:font.bold,color:palette.pine}}>Lihat semua rekomendasi</Text>
       </Pressable>
      </View>:results.map((route,index)=>
       <RouteCard key={route.id} route={route} featured={!filters.savedOnly&&index===0}
        saved={favorites.has(route.id)} onToggleSave={()=>toggleFavorite(route.id)}/>)}
   </View>
   <Text style={{fontFamily:font.medium,color:palette.tertiaryText,fontSize:11,
    lineHeight:18,textAlign:'center'}}>
    Rute berwarna hijau memakai contoh model jaringan jalan OSM; preset sketsa
    menggunakan garis lurus antartitik. Durasi, lokasi checkpoint, dan kondisi
    jalan belum diverifikasi. Belum ada navigasi langsung.
   </Text>
  </ScrollView>
  <AppNav/>
 </SafeAreaView>;
}
