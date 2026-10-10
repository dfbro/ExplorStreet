import {BarChart3,ClipboardList,Plus,Store,Ticket,Users} from '@/components/icons';
import {router} from 'expo-router';
import {useState} from 'react';
import {Text,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {AppPage} from '@/components/app-page';
import {Action,Body,Field,Heading,Panel,StatusNote} from '@/components/primitives';
import {useDemoStore} from '@/features/demo/demo-store';
import {font,palette,radius} from '@/theme/tokens';

function Metric({label,value,icon:Icon}:{label:string;value:number;icon:typeof Store}){
 return <View style={{flex:1,minWidth:126,backgroundColor:palette.surface,borderRadius:18,
   borderWidth:1,borderColor:palette.line,padding:16,gap:8}}>
   <Icon size={20} color={palette.pine}/>
   <Text style={{fontFamily:font.extra,fontSize:30,color:palette.ink}}>{value}</Text>
   <Text style={{fontFamily:font.medium,fontSize:12,color:palette.secondaryText,lineHeight:17}}>{label}</Text>
 </View>;
}
export function PartnerDashboardScreen(){
 const {data,addPromo,error}=useDemoStore();
 const [merchant,setMerchant]=useState('');
 const [offer,setOffer]=useState('');
 const [price,setPrice]=useState('12000');
 const [notice,setNotice]=useState('');
 const submit=()=>{
  const amount=Number(price);
  if(merchant.trim().length<3||offer.trim().length<4||!Number.isFinite(amount)||amount<0||amount>1_000_000) {
   setNotice('Isi nama merchant, promo, dan harga yang valid.');return;
  }
  addPromo(merchant.trim(),offer.trim(),amount);
  setMerchant('');setOffer('');setPrice('12000');
  setNotice('Kartu promo contoh dibuat. Lihat di Pit-stop.');
 };
 return <AppPage title="Dashboard mitra" subtitle="Uji konsep B2B sebelum ada integrasi merchant sungguhan." partner>
  <LinearGradient colors={['#173F2D','#236C4D']} style={{padding:22,borderRadius:radius.hero,gap:11,overflow:'hidden'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
    <Store size={20} color={palette.lime}/>
    <Text style={{fontFamily:font.bold,color:palette.lime,fontSize:12}}>Merchant workspace</Text>
   </View>
   <Text style={{fontFamily:font.extra,color:'white',fontSize:29,lineHeight:33}}>
    Temukan pelanggan{String.fromCharCode(10)}dengan cara relevan.
   </Text>
   <Text style={{fontFamily:font.medium,color:'#D8EBD8',fontSize:13,lineHeight:20}}>
    Buat promo, lihat minat, dan uji kerja sama komunitas.
   </Text>
  </LinearGradient>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
   <Heading icon={BarChart3}>Aktivitas demo</Heading>
   <Text style={{fontFamily:font.bold,color:palette.pine,fontSize:11}}>LOKAL</Text>
  </View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
   <Metric label="Detail rute dibuka" value={data.routeViews} icon={BarChart3}/>
   <Metric label="Voucher dilihat" value={data.voucherViews} icon={Ticket}/>
   <Metric label="Agenda diminati" value={data.interest.length} icon={Users}/>
   <Metric label="Laporan dibuat" value={data.reports.length} icon={ClipboardList}/>
  </View>
  <StatusNote text="Metrik menunjukkan interaksi di perangkat ini. Bukan jumlah pelanggan, penukaran di kasir, atau pendapatan bisnis."/>
  <Panel>
   <Heading icon={Plus}>Buat promo contoh</Heading>
   <Field label="Nama merchant" value={merchant} onChangeText={setMerchant} maxLength={45}
    placeholder="Contoh: Kedai Pagi"/>
   <Field label="Judul penawaran" value={offer} onChangeText={setOffer} maxLength={58}
    placeholder="Contoh: Diskon minuman setelah aktivitas"/>
   <Field label="Harga contoh (Rupiah)" value={price} onChangeText={setPrice}
    keyboardType="numeric" placeholder="12000" maxLength={7}/>
   <Action label="Buat promo" icon={Plus} onPress={submit}/>
   {notice?<StatusNote text={notice}/>:null}
   {error?<StatusNote text={error}/>:null}
   <Action kind="outline" label="Buka katalog Pit-stop" onPress={()=>router.push('/stops')}/>
  </Panel>
  <Panel>
   <Heading>Hipotesis pendapatan</Heading>
   <Body>Penempatan sponsor transparan dapat diuji. Sistem penukaran voucher, atribusi konversi, dan biaya langganan memerlukan kerja sama merchant dan pengukuran riil.</Body>
   <Body>Kita tidak menyimpan koordinat GPS pelanggan atau menampilkan statistik pengguna individual.</Body>
  </Panel>
 </AppPage>;
}
