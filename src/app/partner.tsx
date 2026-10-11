import { PartnerDashboardScreen } from '@/screens/partner-dashboard';
import {AppPage} from '@/components/app-page';
import {Body,Panel} from '@/components/primitives';
import {usePresetStore} from '@/features/map/preset-store';

export default function Screen() {
  const {mode}=usePresetStore();
  if(mode!=='admin')return <AppPage title="Mode User" subtitle="Dashboard mitra hanya tampil dalam mode Admin.">
    <Panel><Body>Ubah ke mode Admin melalui toggle di kanan atas untuk melihat dashboard demo.</Body></Panel>
  </AppPage>;
  return <PartnerDashboardScreen />;
}
