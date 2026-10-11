import {router,useLocalSearchParams} from 'expo-router';
import {AlertTriangle,CheckCircle2,Clock3,Flag,MapPin,Pause,Play,RotateCcw,Route as RouteIcon} from '@/components/icons';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import {AreaMap} from '@/components/area-map';
import {AppPage} from '@/components/app-page';
import {Action,Body,Chip,Field,Heading,Panel,StatusNote} from '@/components/primitives';
import {checkpoints} from '@/features/demo/demo-data';
import {useDemoStore} from '@/features/demo/demo-store';
import {useRoutes} from '@/features/routes/use-routes';
import {font,palette} from '@/theme/tokens';

const categories=['Trotoar terhalang','Permukaan rusak','Lalu lintas padat','Pit-stop tidak tersedia'];
function clock(seconds:number){return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
export function LiveNavScreen(){
 const {route:requested}=useLocalSearchParams<{route?:string}>();
 const {routes}=useRoutes();
 const {data,addReport,addRecap}=useDemoStore();
 const [selected,setSelected]=useState<string|null>(null);
 const [step,setStep]=useState(0);
 const [seconds,setSeconds]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [pickerExpanded,setPickerExpanded]=useState(false);
 const [reportOpen,setReportOpen]=useState(false);
 const [category,setCategory]=useState(categories[0]);
 const [note,setNote]=useState('');
 const [notice,setNotice]=useState('');
 const elapsedRef=useRef(0);
 const routeId=selected??(requested&&routes.some(x=>x.id===requested)?requested:null)??routes[0]?.id;
 const route=useMemo(()=>routes.find(x=>x.id===routeId)??null,[routes,routeId]);
 const progress=Math.round(step/(checkpoints.length-1)*100);
 useEffect(()=>{
  if(!playing)return;
  const timer=setInterval(()=>{
   elapsedRef.current++;
   setSeconds(elapsedRef.current);
   if(elapsedRef.current%5===0){
     setStep(s=>Math.min(s+1,checkpoints.length-1));
   }
   if(elapsedRef.current>=20)setPlaying(false);
  },1000);
  return()=>clearInterval(timer);
 },[playing]);
 const reset=()=>{setPlaying(false);elapsedRef.current=0;setStep(0);setSeconds(0);setNotice('');};
 const choose=(id:string)=>{setSelected(id);setPickerExpanded(false);reset();};
 const finish=()=>{
  if(!route)return;
  if(step===0&&seconds===0){setNotice('Mulai simulasi atau lanjutkan satu checkpoint dahulu.');return;}
  setPlaying(false);
  addRecap(route.id,progress,seconds);
  router.push('/feed');
 };
 const submitReport=()=>{
  if(!route)return;
  addReport(category,note.trim(),route.area);
  setReportOpen(false);setNote('');setNotice('Laporan contoh disimpan pribadi di perangkat ini.');
 };
 return <AppPage title="Navigasi & laporan" subtitle="Jalankan simulasi perjalanan. Gunakan peta untuk melihat konteks area.">
  <Panel>
   <View style={{flexDirection:'row',alignItems:'center',gap:11}}>
    <RouteIcon size={22} color={palette.pine}/>
    <View style={{flex:1,gap:3}}>
     <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:11}}>Rute simulasi</Text>
     <Text numberOfLines={2} style={{fontFamily:font.display,color:palette.ink,fontSize:17}}>
      {route?.name??'Memuat rute...'}
     </Text>
    </View>
    <Pressable onPress={()=>setPickerExpanded(v=>!v)} accessibilityRole="button"
     accessibilityState={{expanded:pickerExpanded}}
     style={({pressed})=>({minHeight:44,minWidth:67,alignItems:'center',justifyContent:'center',
      paddingHorizontal:12,borderRadius:12,backgroundColor:palette.pale,opacity:pressed?.7:1})}>
     <Text style={{fontFamily:font.bold,color:palette.forest,fontSize:12}}>
      {pickerExpanded?'Tutup':'Ganti'}
     </Text>
    </Pressable>
   </View>
   {pickerExpanded?<View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    {routes.map(r=><Chip key={r.id} label={r.name} active={route?.id===r.id} onPress={()=>choose(r.id)}/>)}
   </View>:null}
  </Panel>
  {route?.bundledDefault?<StatusNote text="Preset Ijen yang dimuat adalah sketsa manual. Urutan checkpoint animasi di bawah bersifat demo generik, tidak mewakili rute atau Warung bakso Mas Aji pada file JSON."/ >:null}
  {route?<><Panel tint>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
       <View style={{gap:4}}><Text style={{fontFamily:font.semi,color:palette.pine,fontSize:12}}>Playback virtual</Text>
        <Text style={{fontFamily:font.extra,color:palette.forest,fontSize:31}}>{progress}%</Text></View>
       <View style={{alignItems:'flex-end',gap:4}}><Clock3 size={19} color={palette.pine}/>
        <Text style={{fontFamily:font.display,color:palette.ink,fontSize:23}}>{clock(seconds)}</Text></View>
      </View>
      <View style={{height:11,borderRadius:10,backgroundColor:'#C9DFC0',overflow:'hidden'}}>
       <View style={{width:`${progress}%` as `${number}%`,height:11,backgroundColor:palette.pine,borderRadius:10}}/>
      </View>
      <View style={{flexDirection:'row',gap:8,alignItems:'center'}}>
       <Flag size={20} color={palette.forest}/>
       <View style={{flex:1,gap:3}}>
        <Text style={{fontFamily:font.display,fontSize:17,color:palette.ink}}>{checkpoints[step].name}</Text>
        <Body>{checkpoints[step].detail}</Body>
       </View>
      </View>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
       <View style={{flex:1,minWidth:136}}>
        <Action label={playing?'Jeda':'Mulai sesi'} icon={playing?Pause:Play} onPress={()=>{
         if(step>=4)reset();setPlaying(p=>!p);
        }}/>
       </View>
       <View style={{flex:1,minWidth:136}}>
        <Action kind="secondary" label="Checkpoint lanjut" icon={Flag} onPress={()=>{
         setStep(s=>Math.min(s+1,4));if(step===3)setPlaying(false);
        }} disabled={step===4}/>
       </View>
      </View>
      <Action kind="outline" label="Akhiri dan buat rekap" icon={CheckCircle2} onPress={finish}/>
      <Action kind="outline" label="Ulangi simulasi" icon={RotateCcw} onPress={reset}/>
      {notice?<StatusNote text={notice}/>:null}
    </Panel>
    <View style={{gap:11}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:7}}>
       <MapPin size={17} color={palette.forest}/>
       <Text style={{fontFamily:font.display,color:palette.ink,fontSize:19}}>
        Peta area {route.area}
       </Text>
      </View>
      <AreaMap area={route.area} routeId={route.id} height={300} compact/>
    </View>
   </>:<StatusNote text="Memuat rute demo..."/>}
   <Panel>
    <Heading icon={AlertTriangle}>Laporan jalan</Heading>
    <Body>Catat temuan contoh. Laporan belum dikirim ke pengguna lain.</Body>
    <Action kind="secondary" label={reportOpen?'Tutup formulir':'Buat laporan contoh'} onPress={()=>setReportOpen(p=>!p)}/>
    {reportOpen?<View style={{gap:13}}>
      <Text style={{fontFamily:font.bold,color:palette.ink}}>Kategori</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
       {categories.map(c=><Chip key={c} label={c} active={category===c} onPress={()=>setCategory(c)}/>)}
      </View>
      <Field label="Catatan opsional" value={note} onChangeText={setNote} multiline maxLength={160} placeholder="Jangan tulis alamat rumah atau sekolah."/>
      <Action label="Simpan laporan lokal" onPress={submitReport}/>
    </View>:null}
    {data.reports.length?data.reports.slice(0,6).map(report=>
      <View key={report.id} style={{borderTopWidth:1,borderColor:palette.line,paddingTop:10,gap:5}}>
       <Text style={{fontFamily:font.bold,fontSize:13,color:palette.ink}}>{report.type}</Text>
       <Text style={{fontFamily:font.medium,fontSize:12,color:palette.secondaryText}}>{report.area}</Text>
       {report.note?<Body>{report.note}</Body>:null}
       <Text style={{fontFamily:font.semi,fontSize:11,color:palette.pine}}>Draf lokal</Text>
      </View>):<StatusNote text="Belum ada laporan yang dibuat."/>}
   </Panel>
   <StatusNote text="Peta menunjukkan posisi area perkiraan. Simulator tidak menghitung lintasan, memberi arah belok, merekam GPS, atau memverifikasi kondisi jalan."/>
 </AppPage>;
}
