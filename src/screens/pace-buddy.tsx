import {Bike,CalendarDays,MapPin,Users,Footprints} from '@/components/icons';
import {useState} from 'react';
import {Text,View} from 'react-native';
import {AppPage} from '@/components/app-page';
import {Action,Body,Chip,Heading,Panel,StatusNote} from '@/components/primitives';
import {groupEvents,type EventStyle} from '@/features/demo/demo-data';
import {useDemoStore} from '@/features/demo/demo-store';
import type {Sport} from '@/features/routes/model';
import {font,palette} from '@/theme/tokens';

export function PaceBuddyScreen(){
 const [sport,setSport]=useState<'all'|Sport>('all');
 const [style,setStyle]=useState<'all'|EventStyle>('all');
 const {data,toggleInterest}=useDemoStore();
 const filtered=groupEvents.filter(e=>(sport==='all'||e.sport===sport)&&(style==='all'||e.style===style));
 return <AppPage title="Pace Buddy" subtitle="Temukan kegiatan kelompok sesuai aktivitas dan ritmemu.">
  <Panel tint><Heading icon={Users}>Lebih seru kalau bareng</Heading>
   <Body>Pilih agenda contoh di titik kumpul publik. Tidak ada pelacakan orang, chat anonim, atau undangan nyata.</Body>
  </Panel>
  <Panel>
   <Heading>Pilih kegiatan</Heading>
   <Text style={{fontFamily:font.bold,color:palette.ink}}>Jenis aktivitas</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    <Chip label="Semua" active={sport==='all'} onPress={()=>setSport('all')}/>
    <Chip label="Lari" active={sport==='run'} onPress={()=>setSport('run')}/>
    <Chip label="Gowes" active={sport==='bike'} onPress={()=>setSport('bike')}/>
   </View>
   <Text style={{fontFamily:font.bold,color:palette.ink}}>Ritme</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    <Chip label="Semua" active={style==='all'} onPress={()=>setStyle('all')}/>
    <Chip label="Santai" active={style==='easy'} onPress={()=>setStyle('easy')}/>
    <Chip label="Stabil" active={style==='steady'} onPress={()=>setStyle('steady')}/>
   </View>
  </Panel>
  <Heading>Agenda kelompok ({filtered.length})</Heading>
  {filtered.length?filtered.map(event=>{
   const Icon=event.sport==='run'?Footprints:Bike;
   const saved=data.interest.includes(event.id);
   return <Panel key={event.id}>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:7}}>
      <Icon size={18} color={palette.pine}/>
      <Text style={{fontFamily:font.bold,color:palette.pine,fontSize:12}}>
       {event.sport==='run'?'Lari':'Gowes'}</Text>
     </View>
     <Text style={{fontFamily:font.semi,fontSize:12,color:palette.secondaryText}}>
       {event.style==='easy'?'Santai':'Stabil'}</Text>
    </View>
    <Text style={{fontFamily:font.display,fontSize:21,color:palette.ink}}>{event.name}</Text>
    <Body>{event.organizer}</Body>
    <View style={{gap:9}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
      <CalendarDays size={16} color={palette.pine}/>
      <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:13}}>{event.when}</Text>
     </View>
     <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
      <MapPin size={16} color={palette.pine}/>
      <Text style={{fontFamily:font.medium,color:palette.secondaryText,fontSize:13}}>Area {event.area}</Text>
     </View>
    </View>
    <Body>{event.note}</Body>
    <Action kind={saved?'secondary':'primary'} label={saved?'Batalkan minat':'Saya tertarik'} onPress={()=>toggleInterest(event.id)}/>
   </Panel>;
  }):<StatusNote text="Belum ada kegiatan contoh untuk filter ini. Coba kombinasi lainnya."/>}
  <StatusNote text="Tombol minat hanya menyimpan preferensi lokal. Tidak mendaftarkanmu ke acara nyata."/>
 </AppPage>;
}
