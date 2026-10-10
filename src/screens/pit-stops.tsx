import {Bike,Coffee,Gift,MapPin,Tag,X} from '@/components/icons';
import {useMemo,useState} from 'react';
import {Modal,Pressable,Text,View} from 'react-native';
import {AppPage} from '@/components/app-page';
import {AreaMap} from '@/components/area-map';
import {Action,Body,Chip,Heading,Panel,StatusNote} from '@/components/primitives';
import {rupiah,sampleMerchants,type Merchant} from '@/features/demo/demo-data';
import {useDemoStore} from '@/features/demo/demo-store';
import {font,palette,radius} from '@/theme/tokens';

export function PitStopsScreen(){
 const {data,viewVoucher}=useDemoStore();
 const [filter,setFilter]=useState<'all'|'budget'|'bike'>('all');
 const [cafeArea,setCafeArea]=useState('Ijen');
 const [selected,setSelected]=useState<Merchant|null>(null);
 const merchants=useMemo(()=>[...data.promos,...sampleMerchants].filter(m=>
  filter==='all'||(filter==='budget'&&m.price<15000)||(filter==='bike'&&m.bike)),[data.promos,filter]);
 const open=(m:Merchant)=>{setSelected(m);viewVoucher();};
 return <AppPage title="Pit-stop & promo" subtitle="Inspirasi tempat singgah untuk melengkapi aktivitas luar ruang.">
  <Panel>
   <Heading icon={MapPin}>Kafe di peta OSM</Heading>
   <Body>Pilih area, lalu cari titik kafe yang benar-benar tercatat di OpenStreetMap. Hasil tidak otomatis berarti ada promo.</Body>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    {['Ijen','Kayutangan','Lowokwaru','Blimbing','Sukun'].map(area=>
      <Chip key={area} label={area} active={cafeArea===area} onPress={()=>setCafeArea(area)}/>)}
   </View>
   <AreaMap area={cafeArea} height={260} compact/>
  </Panel>
  <Panel>
   <Heading icon={Coffee}>Cari tempat rehat</Heading>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    <Chip label="Semua" active={filter==='all'} onPress={()=>setFilter('all')}/>
    <Chip label="Harga < Rp15.000" active={filter==='budget'} onPress={()=>setFilter('budget')}/>
    <Chip label="Ramah sepeda" active={filter==='bike'} onPress={()=>setFilter('bike')}/>
   </View>
  </Panel>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
   <Heading>Pilihan singgah</Heading>
   <Text style={{fontFamily:font.semi,color:palette.secondaryText,fontSize:12}}>{merchants.length} tempat</Text>
  </View>
  {merchants.length?merchants.map(m=><Panel key={m.id}>
   <View style={{height:80,backgroundColor:m.category==='coffee'?'#F6E4BE':'#DFEFE0',
    borderRadius:radius.medium,flexDirection:'row',alignItems:'center',paddingHorizontal:17,gap:13,overflow:'hidden'}}>
     <View style={{width:57,height:57,borderRadius:18,backgroundColor:'rgba(255,255,255,.56)',
      alignItems:'center',justifyContent:'center'}}>
      <Coffee size={34} color={palette.pine}/>
     </View>
     <View style={{flex:1,gap:3}}>
      <Text style={{fontFamily:font.display,fontSize:17,color:palette.forest}}>
       {m.created?'Promo buatanmu':'Inspirasi pit-stop'}
      </Text>
      <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:12}}>
       {m.created?'Draf pribadi':'Data contoh'}
      </Text>
     </View>
   </View>
   <Text style={{fontFamily:font.display,fontSize:19,color:palette.ink}}>{m.name}</Text>
   <View style={{flexDirection:'row',gap:7,alignItems:'center'}}>
    <MapPin size={16} color={palette.pine}/>
    <Text style={{fontFamily:font.medium,fontSize:12,color:palette.secondaryText}}>{m.area}</Text>
   </View>
   <Body>{m.description}</Body>
   {m.bike?<View style={{flexDirection:'row',gap:7,alignItems:'center'}}>
     <Bike size={16} color={palette.pine}/><Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:12}}>Fasilitas sepeda (belum diverifikasi)</Text>
   </View>:null}
   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
    <View><Text style={{fontFamily:font.display,color:palette.forest,fontSize:20}}>{rupiah(m.price)}</Text>
     <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:11}}>Harga ilustrasi</Text></View>
    <View style={{flex:1,alignItems:'flex-end'}}><Tag size={19} color={palette.pine}/></View>
   </View>
   <Body>{m.offer}</Body>
   <Action label="Lihat voucher demo" icon={Gift} onPress={()=>open(m)}/>
  </Panel>):<StatusNote text="Tidak ada tempat contoh untuk filter ini."/>}
  <StatusNote text="Pencarian kafe berasal dari OSM. Kartu merchant, harga, dan promo di bawahnya masih fiktif dan tidak berhubungan dengan kafe OSM tersebut."/>
  <Modal visible={!!selected} animationType="fade" transparent onRequestClose={()=>setSelected(null)}>
    <View style={{flex:1,backgroundColor:'rgba(20,45,30,.65)',justifyContent:'center',padding:22}}>
      <View style={{borderRadius:radius.large,padding:22,backgroundColor:palette.surface,gap:15}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
         <Text style={{fontFamily:font.display,fontSize:21,color:palette.ink}}>Voucher contoh</Text>
         <Pressable onPress={()=>setSelected(null)} accessibilityRole="button" accessibilityLabel="Tutup voucher"
          style={{width:45,height:45,alignItems:'center',justifyContent:'center'}}>
          <X size={23} color={palette.forest}/>
         </Pressable>
        </View>
        <View style={{backgroundColor:palette.pale,borderRadius:radius.medium,padding:21,alignItems:'center',gap:11}}>
         <Gift size={44} color={palette.forest}/>
         <Text style={{fontFamily:font.display,fontSize:24,color:palette.ink,textAlign:'center'}}>{selected?.name}</Text>
         <Body>{selected?.offer}</Body>
         <View style={{borderWidth:2,borderStyle:'dashed',borderColor:'#9BCA8E',borderRadius:14,padding:16,width:'100%'}}>
          <Text style={{fontFamily:font.extra,fontSize:25,color:palette.forest,textAlign:'center'}}>DEMO-ONLY</Text>
         </View>
         <Text style={{fontFamily:font.semi,color:palette.danger,textAlign:'center',fontSize:12}}>
          Tidak berlaku di kasir. Tidak dapat ditukar.
         </Text>
        </View>
        <Action label="Kembali ke katalog" onPress={()=>setSelected(null)}/>
      </View>
    </View>
  </Modal>
 </AppPage>;
}
