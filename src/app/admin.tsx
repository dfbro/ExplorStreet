import {router} from 'expo-router';
import {RouteStudioScreen} from '@/screens/route-studio';
import {AppPage} from '@/components/app-page';
import {Action,Panel,Heading,Body} from '@/components/primitives';
import {usePresetStore} from '@/features/map/preset-store';

export default function AdminPage(){
 const {mode,ready}=usePresetStore();
 if(!ready)return null;
 if(mode!=='admin')return <AppPage title="Mode User" subtitle="Pengelolaan preset hanya ditampilkan ketika mode Admin dipilih.">
  <Panel><Heading>Studio administrator</Heading>
   <Body>Toggle mode di kanan atas adalah pratinjau UI, bukan sistem login atau pengamanan data produksi.</Body>
   <Action label="Kembali ke rute" onPress={()=>router.replace('/')}/>
  </Panel>
 </AppPage>;
 return <RouteStudioScreen adminMode/>;
}
