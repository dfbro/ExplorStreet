import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Bike, Bookmark, BookmarkCheck, Check, Clock3, Footprints, Info, MapPin, Mountain, Play, Plus, Route as RouteIcon, ShieldAlert } from '@/components/icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { AreaMap } from '@/components/area-map';
import { useDemoStore } from '@/features/demo/demo-store';
import { Action } from '@/components/primitives';
import type { RouteInfo } from '@/features/routes/model';
import { useRoutePreferences } from '@/features/routes/preferences';
import { formatDistance } from '@/features/routes/ranking';
import { routeRepository } from '@/features/routes/repository';
import {usePresetStore} from '@/features/map/preset-store';
import { font, palette, radius } from '@/theme/tokens';

type DetailState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; route: RouteInfo };

function DetailFact({ icon: Icon, value, label }: {
  icon: typeof Clock3; value: string; label: string;
}) {
  return (
    <View style={{ flex: 1, minWidth: 90, backgroundColor: '#F0F6EC', borderRadius: radius.medium,
      paddingHorizontal: 13, paddingVertical: 15, gap: 7 }}>
      <Icon size={19} color={palette.pine}/>
      <Text style={{ fontFamily: font.display, fontSize: 21, color: palette.ink }}>{value}</Text>
      <Text style={{ fontFamily: font.medium, fontSize: 12, color: palette.secondaryText }}>{label}</Text>
    </View>
  );
}

export function RouteDetailScreen() {
  const {routes:storedRoutes,ready:presetsReady}=usePresetStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { favorites, ready, toggleFavorite, saveError } = useRoutePreferences();
  const [state, setState] = useState<DetailState>({ status: 'loading' });
  const { viewRoute } = useDemoStore();
  const seen = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id || typeof id !== 'string') {
      Promise.resolve().then(() => { if (active) setState({ status: 'missing' }); });
      return () => { active = false; };
    }
    if(!presetsReady)return()=>{active=false;};
    routeRepository.find(id,storedRoutes)
      .then((route) => { if (active) setState(route ? { status: 'ready', route } : { status: 'missing' }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, [id,storedRoutes,presetsReady]);

  const route = state.status === 'ready' && state.route.id === id ? state.route : null;
  useEffect(() => {
    if (!route || seen.current === route.id) return;
    seen.current = route.id;
    viewRoute();
  }, [route, viewRoute]);
  const saved = route ? favorites.has(route.id) : false;
  const sportLabel = route?.sport === 'run' ? 'Lari' : 'Gowes';
  const SportIcon = route?.sport === 'run' ? Footprints : Bike;

  return (
    <>
      <Stack.Screen options={{ title: route ? route.name : 'Detail rute' }}/>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: palette.background }}
        contentContainerStyle={{
          width: '100%', alignSelf: 'center', maxWidth: 950, padding: 17, paddingBottom: 64,
          gap: 18,
        }}>
        {state.status === 'loading' || !ready ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 310, gap: 12 }}>
            <ActivityIndicator size="large" color={palette.pine}/>
            <Text style={{ fontFamily: font.medium, color: palette.secondaryText }}>Memuat detail rute...</Text>
          </View>
        ) : !route ? (
          <View style={{ backgroundColor: palette.surface, borderRadius: radius.large,
            padding: 24, minHeight: 260, justifyContent: 'center', gap: 13 }}>
            <Text style={{ fontFamily: font.display, fontSize: 25, color: palette.ink }}>
              {state.status === 'error' ? 'Tidak dapat memuat rute' : 'Rute tidak ditemukan'}
            </Text>
            <Text style={{ fontFamily: font.medium, fontSize: 14, color: palette.secondaryText }}>
              Kembali ke katalog untuk memilih rute lain.
            </Text>
            <Pressable onPress={() => router.replace('/')} accessibilityRole="button"
              style={{ backgroundColor: palette.forest, borderRadius: 14, minHeight: 48,
                alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: palette.white, fontFamily: font.bold }}>Ke katalog rute</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} color={palette.pine}/>
              <Text style={{ fontFamily: font.semi, fontSize: 13, color: palette.secondaryText }}>{route.area}</Text>
              <View style={{ width: 5, height: 5, borderRadius: 4, backgroundColor: palette.pine }}/>
              <SportIcon size={16} color={palette.pine}/>
              <Text style={{ fontFamily: font.semi, fontSize: 13, color: palette.secondaryText }}>{sportLabel}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Text style={{ fontFamily: font.extra, fontSize: width > 680 ? 36 : 29,
                lineHeight: width > 680 ? 39 : 33, flex: 1, color: palette.ink }}>
                {route.name}
              </Text>
              <View style={{ backgroundColor: palette.pale, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ fontFamily: font.bold, fontSize: 11, color: palette.forest }}>{route.bundledDefault?'Preset default':route.manualSketch?'Rute pribadi':'Contoh'}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: font.medium, fontSize: 14, color: palette.secondaryText, lineHeight: 22 }}>
              {route.summary}
            </Text>
            <AreaMap area={route.area} routeId={route.id} height={width > 760 ? 370 : 330}/>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
              <DetailFact icon={RouteIcon} label={route.manualSketch?'Estimasi sketsa':'Jarak model jalan'} value={`${formatDistance(route.distanceKm)} km`}/>
              {route.durationMin!==undefined?<DetailFact icon={Clock3} label="Durasi contoh" value={`${route.durationMin} mnt`}/>:null}
              {route.ascentM!==undefined?<DetailFact icon={Mountain} label="Tanjakan contoh" value={`+${route.ascentM} m`}/>:null}
            </View>
            <View style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line,
              borderRadius: radius.large, padding: 18, gap: 15 }}>
              <Text style={{ color: palette.ink, fontFamily: font.display, fontSize: 20 }}>Tentang rute</Text>
              <Text style={{ color: palette.secondaryText, fontFamily: font.medium, fontSize: 14, lineHeight: 22 }}>
                {route.notes}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {route.tags.map((tag) => (
                  <View key={tag} style={{ borderRadius: 50, backgroundColor: palette.pale, paddingHorizontal: 13, paddingVertical: 8 }}>
                    <Text style={{ fontFamily: font.semi, fontSize: 12, color: palette.forest }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ borderRadius: radius.large, backgroundColor: '#FFF4E5',
              padding: 15, flexDirection: 'row', gap: 11 }}>
              <ShieldAlert size={22} color="#946528"/>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={{ color: '#76551F', fontFamily: font.bold, fontSize: 14 }}>Belum untuk navigasi</Text>
                <Text style={{ color: '#755E39', fontFamily: font.medium, fontSize: 12, lineHeight: 19 }}>
                  {route.manualSketch
                   ?'Garis ungu putus-putus adalah sketsa pengguna, bukan jalur yang disesuaikan ke jalan. Jarak merupakan estimasi antartitik, bukan jarak jalan. Belum ada data elevasi atau durasi. Lokasi checkpoint dan rute belum diverifikasi; bukan navigasi aktif.'
                   :'Garis hijau berasal dari routing pedestrian/sepeda di jaringan jalan OpenStreetMap. Jarak berasal dari model OSRM; elevasi dan durasi masih perkiraan contoh. Rute belum diperiksa di lapangan, bukan petunjuk keselamatan atau navigasi aktif.'}
                </Text>
              </View>
            </View>
            {saveError ? <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Info size={18} color={palette.danger} />
              <Text style={{ fontFamily: font.medium, color: palette.danger, fontSize: 12, flex: 1 }}>{saveError}</Text>
            </View> : null}
            <Action label={route.bundledDefault?'Lihat simulator generik (bukan rute ini)':'Coba simulator navigasi'} icon={Play}
              onPress={() => router.push({pathname:'/nav',params:{route:route.id}})}/>
            <Action label="Buat dan simpan rute sendiri" icon={Plus}
              onPress={() => router.push('/studio')}/>
            <Pressable onPress={() => toggleFavorite(route.id)} accessibilityRole="button"
              accessibilityState={{ selected: saved }}
              style={({ pressed }) => ({
                backgroundColor: saved ? palette.pale : palette.forest,
                minHeight: 55, borderRadius: radius.medium, flexDirection: 'row',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: pressed ? .76 : 1,
              })}>
              {saved ? <Check size={20} color={palette.forest}/> : <Bookmark size={20} color={palette.white}/>}
              <Text style={{ fontFamily: font.bold, color: saved ? palette.forest : palette.white, fontSize: 15 }}>
                {saved ? 'Tersimpan — hapus dari favorit' : 'Simpan rute ini'}
              </Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/')} accessibilityRole="button"
              style={{ minHeight: 46, alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 7 }}>
              <BookmarkCheck size={17} color={palette.pine}/>
              <Text style={{ fontFamily: font.bold, color: palette.pine, fontSize: 13 }}>
                Lihat rute lain
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </>
  );
}
