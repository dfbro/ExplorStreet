import {Check,Heart,MessagesSquare,Play,Send,Trophy} from '@/components/icons';
import {router} from 'expo-router';
import {useMemo,useState} from 'react';
import {Text,View} from 'react-native';
import {AppPage} from '@/components/app-page';
import {Action,Body,Field,Heading,Panel,StatusNote} from '@/components/primitives';
import {samplePosts} from '@/features/demo/demo-data';
import {useDemoStore} from '@/features/demo/demo-store';
import {useRoutes} from '@/features/routes/use-routes';
import {formatDistance} from '@/features/routes/ranking';
import {font,palette} from '@/theme/tokens';

export function RecapFeedScreen(){
 const {data,addPost,toggleKudos}=useDemoStore();
 const {routes}=useRoutes();
 const [text,setText]=useState('');
 const [notice,setNotice]=useState('');
 const recap=data.recaps[0];
 const route=routes.find(r=>r.id===recap?.routeId);
 const distance=recap&&route?formatDistance(route.distanceKm*recap.progress/100):'0';
 const posts=useMemo(()=>[...data.posts,...samplePosts],[data.posts]);
 const save=()=>{
  const value=text.trim();
  if(value.length<5){setNotice('Tulis setidaknya 5 karakter.');return;}
  addPost(value);setText('');setNotice('Catatan disimpan pribadi di perangkat.');
 };
 return <AppPage title="Rekap & komunitas" subtitle="Kumpulkan momen dan inspirasi, tanpa harus membagikan lokasi pribadi.">
  <Panel tint>
   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
    <Heading icon={Trophy}>Rekap terakhir</Heading>
    <Text style={{fontFamily:font.bold,fontSize:11,color:palette.pine}}>SIMULASI</Text>
   </View>
   {recap&&route?<View style={{gap:12}}>
     <Text style={{fontFamily:font.display,fontSize:20,color:palette.ink}}>{route.name}</Text>
     <View style={{flexDirection:'row',gap:9}}>
      {[['Jarak demo',distance+' km'],['Progres',recap.progress+'%'],['Durasi',recap.elapsedSec+' dtk']].map(([label,value])=>
       <View key={label} style={{flex:1,padding:12,backgroundColor:'white',borderRadius:14,gap:7}}>
        <Text style={{fontFamily:font.display,fontSize:18,color:palette.forest}}>{value}</Text>
        <Text style={{fontFamily:font.medium,fontSize:11,color:palette.secondaryText}}>{label}</Text>
       </View>)}
     </View>
     <Body>Rekap dihasilkan oleh playback virtual, bukan sensor aktivitas fisik.</Body>
    </View>:<View style={{gap:11}}><Body>Belum ada sesi demo. Jalankan simulator navigasi untuk membuat rekap.</Body>
     <Action label="Coba simulator" icon={Play} onPress={()=>router.push('/nav')}/></View>}
  </Panel>
  <Panel>
   <Heading icon={MessagesSquare}>Catatan pribadiku</Heading>
   <Field label="Apa yang menarik dari perjalanan contohmu?" multiline maxLength={180}
     value={text} onChangeText={setText} placeholder="Contoh: Ingin mencoba suasana hijau minggu ini..."/>
   <Action label="Simpan catatan lokal" icon={Send} onPress={save}/>
   {notice?<StatusNote text={notice}/>:null}
   <Body>Catatan tidak dikirim ke server atau orang lain. Jangan masukkan alamat pribadi.</Body>
  </Panel>
  <Heading>Feed komunitas contoh</Heading>
  {posts.map(post=>{
   const liked=data.kudos.includes(post.id);
   return <Panel key={post.id}>
     <View style={{flexDirection:'row',alignItems:'center',gap:11}}>
      <View style={{width:39,height:39,borderRadius:13,backgroundColor:palette.pale,
       alignItems:'center',justifyContent:'center'}}>
       <Text style={{fontFamily:font.display,fontSize:17,color:palette.pine}}>{post.author.charAt(0)}</Text>
      </View>
      <View style={{flex:1,gap:3}}>
       <Text style={{fontFamily:font.bold,color:palette.ink,fontSize:14}}>{post.author}</Text>
       <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:11}}>
        {post.type==='private'?'Hanya di perangkat ini':'Posting fiktif'}
       </Text>
      </View>
     </View>
     <Text style={{fontFamily:font.medium,color:palette.ink,fontSize:14,lineHeight:22}}>{post.text}</Text>
     <View style={{borderTopWidth:1,borderColor:palette.line,paddingTop:9,flexDirection:'row'}}>
      <Action kind={liked?'secondary':'outline'} label={liked?'Diapresiasi':'Apresiasi'}
       icon={liked?Check:Heart} onPress={()=>toggleKudos(post.id)}/>
     </View>
   </Panel>;
  })}
  <StatusNote text="Feed masih lokal: tidak ada akun, pengikut, komentar publik, maupun server komunitas."/>
 </AppPage>;
}
