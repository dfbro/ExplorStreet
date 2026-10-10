import { LinearGradient } from 'expo-linear-gradient';
import { Bike, BookmarkCheck, ChevronLeft, ChevronRight, ExternalLink, Footprints, Info, MapPin, Minus, Plus, Search, SlidersHorizontal, Sparkles, Sun, X } from '@/components/icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { RouteCard } from '@/components/route-card';
import { AreaMap } from '@/components/area-map';
import { AppHeader, AppNav } from '@/components/app-nav';
import type { DistanceBand, Priority, RouteInfo, Sport } from '@/features/routes/model';
import { PRIORITY_TEXT } from '@/features/routes/model';
import { useRoutePreferences } from '@/features/routes/preferences';
import { rankRoutes } from '@/features/routes/ranking';
import { routeRepository } from '@/features/routes/repository';
import { font, palette, radius } from '@/theme/tokens';

const EMPTY_ROUTES: readonly RouteInfo[] = [];
const BANDS: { value: DistanceBand; label: string }[] = [
  { value: 'all', label: 'Semua' }, { value: 'short', label: '2–4 km' },
  { value: 'medium', label: '4–7 km' }, { value: 'long', label: '>7 km' },
];
const PRIORITIES = [
  { key: 'quiet', label: 'Jalan lebih tenang' },
  { key: 'flat', label: 'Minim tanjakan' },
  { key: 'stops', label: 'Tempat singgah' },
] as const;

type RequestState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'content'; routes: readonly RouteInfo[] };

function FilterChip({ label, selected, onPress }: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: 45, minWidth: 70, paddingHorizontal: 14,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: selected ? palette.forest : palette.surface,
        borderWidth: 1, borderColor: selected ? palette.forest : palette.line,
        borderRadius: 13, opacity: pressed ? .75 : 1,
      })}>
      <Text style={{
        color: selected ? palette.white : palette.secondaryText,
        fontFamily: selected ? font.bold : font.semi, fontSize: 12,
      }}>{label}</Text>
    </Pressable>
  );
}

function PriorityControl({ title, value, onChange }: {
  title: string; value: Priority; onChange: (value: Priority) => void;
}) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#E9EFE6',
    }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: font.semi, fontSize: 13, color: palette.ink }}>{title}</Text>
        <Text style={{ fontFamily: font.medium, fontSize: 12, color: palette.secondaryText }}>
          {PRIORITY_TEXT[value]}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
        <Pressable disabled={value === 0} onPress={() => onChange((value - 1) as Priority)}
          accessibilityRole="button" accessibilityLabel={`Kurangi prioritas ${title}`}
          style={({ pressed }) => ({
            width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center',
            backgroundColor: '#ECF4E8', opacity: value === 0 ? .4 : pressed ? .7 : 1,
          })}>
          <Minus size={17} color={palette.forest}/>
        </Pressable>
        <Text accessibilityLabel={`Tingkat ${value} dari 3`}
          style={{ minWidth: 22, textAlign: 'center', fontFamily: font.display, color: palette.forest, fontSize: 16 }}>
          {value}
        </Text>
        <Pressable disabled={value === 3} onPress={() => onChange((value + 1) as Priority)}
          accessibilityRole="button" accessibilityLabel={`Tambah prioritas ${title}`}
          style={({ pressed }) => ({
            width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center',
            backgroundColor: '#ECF4E8', opacity: value === 3 ? .4 : pressed ? .7 : 1,
          })}>
          <Plus size={17} color={palette.forest}/>
        </Pressable>
      </View>
    </View>
  );
}

export function RouteDiscoveryScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 870;
  const insets = useSafeAreaInsets();
  const {
    filters, favorites, ready, saveError, clearSaveError,
    setSport, setDistance, setQuery, setSavedOnly, setWeight, toggleFavorite,
  } = useRoutePreferences();

  const [catalog, setCatalog] = useState<RequestState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [showPriorities, setShowPriorities] = useState(false);
  const [showDataExplanation, setShowDataExplanation] = useState(false);

  useEffect(() => {
    let active = true;
    routeRepository.list()
      .then((routes) => { if (active) setCatalog({ status: 'content', routes }); })
      .catch(() => { if (active) setCatalog({ status: 'error', message: 'Katalog tidak dapat dibaca.' }); });
    return () => { active = false; };
  }, [reloadKey]);

  const routes = catalog.status === 'content' ? catalog.routes : EMPTY_ROUTES;
  const results = useMemo(
    () => rankRoutes(routes, filters, favorites),
    [routes, filters, favorites],
  );
  const highlighted = results[0];

  const toggleSave = useCallback((id: string) => toggleFavorite(id), [toggleFavorite]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 17, paddingTop: 14, paddingBottom: 110 + insets.bottom,
          alignSelf: 'center', width: '100%', maxWidth: 1060, gap: 20,
        }}>
        <AppHeader />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MapPin size={15} color={palette.pine}/>
          <Text style={{ color: palette.secondaryText, fontFamily: font.semi, fontSize: 13 }}>Kota Malang</Text>
          <View style={{ backgroundColor: palette.pale, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5, marginLeft: 7 }}>
            <Text style={{ color: palette.forest, fontFamily: font.bold, fontSize: 11 }}>Rute demo</Text>
          </View>
        </View>

        <LinearGradient colors={['#174C37', '#236D4C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ borderRadius: radius.hero, padding: 23, minHeight: 214, overflow: 'hidden', justifyContent: 'space-between' }}>
          <View style={{ position: 'absolute', right: -78, bottom: -115,
            width: 265, height: 265, borderRadius: 150,
            borderWidth: 30, borderColor: 'rgba(218,242,120,.13)' }}/>
          {width >= 380 ? <View style={{ position: 'absolute', right: 20, bottom: 18, width: 63, height: 63,
            backgroundColor: palette.lime, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
            transform: [{ rotate: '10deg' }] }}>
            <Sun size={31} color={palette.forest} strokeWidth={1.8}/>
          </View> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Sparkles size={15} color={palette.lime}/>
            <Text style={{ color: palette.lime, fontFamily: font.bold, fontSize: 11 }}>TEMAN JALANMU</Text>
          </View>
          <View style={{ paddingRight: width < 380 ? 0 : 45, marginTop: 12 }}>
            <Text style={{ fontFamily: font.extra, fontSize: isWide ? 40 : width < 380 ? 29 : 33,
              lineHeight: isWide ? 45 : width < 380 ? 34 : 37, color: palette.white }}>
              Rute yang pas.{String.fromCharCode(10)}Mood yang enak.
            </Text>
            <Text style={{ color: '#DFEEDC', fontFamily: font.medium, fontSize: 13, lineHeight: 20, maxWidth: 260, marginTop: 11 }}>
              Temukan inspirasi rute olahraga sesuai ritmemu.
            </Text>
          </View>
        </LinearGradient>

        <Pressable onPress={() => setShowDataExplanation((value) => !value)}
          accessibilityRole="button" accessibilityState={{ expanded: showDataExplanation }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 5, minHeight: 38 }}>
          <Info size={16} color={palette.pine}/>
          <Text style={{ fontFamily: font.medium, fontSize: 12, color: palette.secondaryText, flex: 1 }}>
            Rute masih berupa data simulasi.
          </Text>
          {showDataExplanation ? <ChevronLeft size={18} color={palette.pine}/> : <ChevronRight size={18} color={palette.pine}/>}
        </Pressable>
        {showDataExplanation ? (
          <View style={{ backgroundColor: palette.pale, padding: 14, borderRadius: radius.medium }}>
            <Text style={{ color: palette.secondaryText, fontSize: 13, fontFamily: font.medium, lineHeight: 20 }}>
              Peta OpenStreetMap menampilkan jalan sebenarnya, tetapi titik awal, durasi, elevasi,
              dan data kondisi rute olahraga ini belum disurvei. Jangan menganggap pin area sebagai petunjuk navigasi.
            </Text>
          </View>
        ) : null}

        {saveError ? (
          <Pressable onPress={clearSaveError} accessibilityRole="button"
            style={{ backgroundColor: '#FFF0E9', borderRadius: 13, padding: 12, flexDirection: 'row', gap: 8 }}>
            <Info size={17} color={palette.danger}/>
            <Text style={{ color: palette.danger, flex: 1, fontFamily: font.medium, fontSize: 12 }}>{saveError}</Text>
            <X size={18} color={palette.danger}/>
          </Pressable>
        ) : null}

        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
          <View style={{ flex: isWide ? 1.03 : undefined, width: isWide ? undefined : '100%', gap: 17 }}>
            <View style={{ backgroundColor: palette.surface, borderRadius: radius.large,
              borderWidth: 1, borderColor: palette.line, padding: 17, gap: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                <SlidersHorizontal size={18} color={palette.pine}/>
                <Text style={{ fontFamily: font.display, color: palette.ink, fontSize: 20, flex: 1 }}>Atur perjalananmu</Text>
              </View>

              <View style={{ backgroundColor: '#EEF5EB', borderRadius: 14, padding: 5, flexDirection: 'row', gap: 5 }}>
                {(['run','bike'] as Sport[]).map((sport) => {
                  const Icon = sport === 'run' ? Footprints : Bike;
                  const active = filters.sport === sport;
                  return (
                    <Pressable key={sport} accessibilityRole="button" accessibilityState={{ selected: active }}
                      onPress={() => setSport(sport)} style={({ pressed }) => ({
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        gap: 8, minHeight: 46, borderRadius: 11,
                        backgroundColor: active ? palette.surface : 'transparent',
                        opacity: pressed ? .68 : 1,
                      })}>
                      <Icon size={18} color={active ? palette.forest : palette.secondaryText}/>
                      <Text style={{ fontFamily: font.bold, fontSize: 13, color: active ? palette.forest : palette.secondaryText }}>
                        {sport === 'run' ? 'Lari' : 'Gowes'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ gap: 9 }}>
                <Text style={{ fontFamily: font.bold, fontSize: 13, color: palette.ink }}>Jarak yang kamu mau</Text>
                <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
                  {BANDS.map((band) => (
                    <FilterChip key={band.value} label={band.label}
                      selected={filters.distance === band.value} onPress={() => setDistance(band.value)} />
                  ))}
                </View>
              </View>

              <Pressable onPress={() => setShowPriorities((previous) => !previous)}
                accessibilityRole="button" accessibilityState={{ expanded: showPriorities }}
                style={{ minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: palette.ink, fontFamily: font.bold, fontSize: 14, flex: 1 }}>
                  Prioritas suasana
                </Text>
                <Text style={{ color: palette.pine, fontFamily: font.semi, fontSize: 12 }}>
                  {showPriorities ? 'Sembunyikan' : 'Atur'}
                </Text>
                {showPriorities ? <Minus size={16} color={palette.pine}/> : <Plus size={16} color={palette.pine}/>}
              </Pressable>
              {showPriorities ? (
                <View>
                  {PRIORITIES.map(({ key, label }) =>
                    <PriorityControl key={key} title={label} value={filters.weights[key]}
                      onChange={(value) => setWeight(key, value)}/>)}
                </View>
              ) : null}
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: palette.ink, fontFamily: font.display, fontSize: 23 }}>
                  {filters.savedOnly ? 'Rute tersimpan' : 'Rute buat kamu'}
                </Text>
                <Text style={{ fontFamily: font.semi, color: palette.secondaryText, fontSize: 12 }}>
                  {results.length} pilihan
                </Text>
              </View>
              <Pressable onPress={() => setSavedOnly(!filters.savedOnly)} accessibilityRole="button"
                accessibilityState={{ selected: filters.savedOnly }}
                style={({pressed})=>({
                  flexDirection:'row',gap:8,alignItems:'center',alignSelf:'flex-start',
                  backgroundColor:filters.savedOnly?palette.pale:palette.surface,
                  borderColor:palette.line,borderWidth:1,borderRadius:12,paddingHorizontal:12,
                  minHeight:44,opacity:pressed?.7:1,
                })}>
                <BookmarkCheck size={17} color={palette.pine}/>
                <Text style={{fontFamily:font.bold,color:palette.forest,fontSize:12}}>
                  {filters.savedOnly?'Tampilkan semua':'Hanya tersimpan'} ({favorites.size})
                </Text>
              </Pressable>
              <View style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line,
                borderRadius: radius.medium, flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 14, gap: 9 }}>
                <Search size={18} color={palette.pine}/>
                <TextInput value={filters.query} onChangeText={setQuery}
                  placeholder="Cari nama atau area rute" placeholderTextColor="#789080"
                  accessibilityLabel="Cari nama atau area rute" returnKeyType="search"
                  style={{ flex: 1, fontFamily: font.medium, color: palette.ink, fontSize: 13, paddingVertical: 10 }}/>
                {filters.query ? (
                  <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Hapus pencarian" hitSlop={12}>
                    <X size={18} color={palette.pine}/>
                  </Pressable>
                ) : null}
              </View>
              {catalog.status === 'loading' || !ready ? (
                <View style={{ padding: 35, alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator color={palette.pine} size="large"/>
                  <Text style={{ color: palette.secondaryText, fontFamily: font.medium }}>Menyiapkan pilihan rute...</Text>
                </View>
              ) : catalog.status === 'error' ? (
                <View style={{ padding: 22, backgroundColor: palette.surface, borderRadius: radius.large, gap: 11 }}>
                  <Text style={{ color: palette.ink, fontFamily: font.bold }}>{catalog.message}</Text>
                  <Pressable onPress={() => { setCatalog({ status: 'loading' }); setReloadKey((key) => key + 1); }}
                    accessibilityRole="button" style={{ minHeight: 46, justifyContent: 'center' }}>
                    <Text style={{ color: palette.pine, fontFamily: font.bold }}>Coba lagi</Text>
                  </Pressable>
                </View>
              ) : results.length === 0 ? (
                <View style={{ padding: 23, backgroundColor: palette.surface, borderRadius: radius.large, gap: 11 }}>
                  <Text style={{ fontFamily: font.display, color: palette.ink, fontSize: 18 }}>Belum ada yang cocok</Text>
                  <Text style={{ fontFamily: font.medium, color: palette.secondaryText, lineHeight: 20 }}>
                    Coba kata kunci lain atau ubah jenis aktivitas.
                  </Text>
                  <Pressable onPress={() => {setQuery(''); setSavedOnly(false);}}
                    style={{ minHeight: 44, justifyContent: 'center' }} accessibilityRole="button">
                    <Text style={{ color: palette.pine, fontFamily: font.bold }}>Lihat semua rute</Text>
                  </Pressable>
                </View>
              ) : (
                results.map((route, index) => <RouteCard key={route.id} route={route}
                  featured={!filters.savedOnly && index === 0}
                  saved={favorites.has(route.id)} onToggleSave={() => toggleSave(route.id)} />)
              )}
            </View>
          </View>

          {isWide && highlighted ? (
            <View style={{ flex: .97, minWidth: 0, width: '100%', backgroundColor: palette.surface,
              borderWidth: 1, borderColor: palette.line, padding: 16, borderRadius: radius.large, gap: 13 }}>
              <Text style={{ fontFamily: font.display, fontSize: 20, color: palette.ink }}>Intip rute pilihan</Text>
              <AreaMap area={highlighted.area} routeId={highlighted.id} height={300} compact/>
              <Text style={{ fontFamily: font.display, fontSize: 18, color: palette.ink }}>{highlighted.name}</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 13, color: palette.secondaryText }}>
                Garis jingga adalah sketsa contoh, bukan rute yang sudah dihitung mengikuti jalan.
              </Text>
            </View>
          ) : null}
        </View>

        {!isWide ? (
          <View style={{ gap: 11 }}>
            <Text style={{ fontFamily: font.display, color: palette.ink, fontSize: 21 }}>
              Lihat area di peta
            </Text>
            <AreaMap area={highlighted?.area ?? 'Ijen'} routeId={highlighted?.id} height={245} compact/>
            <Pressable accessibilityRole="button" onPress={() => router.push('/nav')}
              style={({ pressed }) => ({
                minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 8,
                opacity: pressed ? .7 : 1,
              })}>
              <ExternalLink size={17} color={palette.pine}/>
              <Text style={{ fontFamily: font.bold, color: palette.pine, fontSize: 13 }}>
                Buka navigasi dan laporan
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <AppNav />
    </SafeAreaView>
  );
}
