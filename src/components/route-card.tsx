import { router } from 'expo-router';
import { ArrowUpRight, Bike, Bookmark, Check, Clock3, Footprints, MapPin, Mountain, Route as RouteIcon } from '@/components/icons';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { RouteInfo } from '@/features/routes/model';
import { formatDistance } from '@/features/routes/ranking';
import { font, palette, radius, space } from '@/theme/tokens';
import { RouteArtwork } from './route-artwork';

export function RouteCard({ route, featured, saved, onToggleSave }: {
  route: RouteInfo;
  featured?: boolean;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const { width } = useWindowDimensions();
  const Icon = route.sport === 'run' ? Footprints : Bike;
  return (
    <View style={{
      borderWidth: 1.5, borderColor: featured ? '#8ABF86' : palette.line,
      borderRadius: radius.large, backgroundColor: palette.surface,
      position:'relative',overflow:'hidden',
    }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Buka rute ${route.name}`}
      onPress={()=>router.push({pathname:'/routes/[id]',params:{id:route.id}})}
      style={({pressed})=>({padding:12,flexDirection:'row',gap:13,opacity:pressed?.83:1})}>
      <RouteArtwork accent={route.accent} sport={route.sport}
        width={width < 300 ? 68 : 92} height={width < 300 ? 116 : 130} />
      <View style={{ flex: 1, minWidth: 0, justifyContent: 'space-between', paddingVertical: 3 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingRight: 38 }}>
          <MapPin size={13} color={palette.pine} />
          <Text style={{ fontFamily: font.semi, fontSize: 12, color: palette.secondaryText }}>{route.area}</Text>
          {featured||route.manualSketch ? <View style={{ backgroundColor: palette.pale, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: palette.forest, fontFamily: font.bold, fontSize: 10 }}>
              {route.bundledDefault?'Preset default':route.manualSketch?'Rute pribadi':'Urutan 1'}
            </Text>
          </View> : null}
        </View>
        <Text numberOfLines={2} style={{
          fontFamily: font.display, fontSize: 17, lineHeight: 21, color: palette.ink,
          marginTop: 7, paddingRight: 20,
        }}>{route.name}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 9 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <RouteIcon size={13} color={palette.pine}/>
            <Text style={{ color: palette.ink, fontFamily: font.semi, fontSize: 11 }}>{formatDistance(route.distanceKm)} km</Text>
          </View>
          {route.durationMin!==undefined?<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock3 size={13} color={palette.pine}/>
            <Text style={{ color: palette.ink, fontFamily: font.semi, fontSize: 11 }}>{route.durationMin} mnt</Text>
          </View>:null}
          {route.ascentM!==undefined?<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Mountain size={13} color={palette.pine}/>
            <Text style={{ color: palette.ink, fontFamily: font.semi, fontSize: 11 }}>+{route.ascentM} m</Text>
          </View>:null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, flexShrink: 1 }}>
            <Icon size={13} color={palette.pine} />
            <Text numberOfLines={1} style={{ color: palette.secondaryText, fontFamily: font.medium, fontSize: 11 }}>
              {route.sport === 'run' ? 'Lari' : 'Gowes'}
            </Text>
          </View>
          <View style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <View style={{
                  minWidth: 70, minHeight: 42, flexDirection: 'row', flexWrap: 'nowrap',
                  gap: 6, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 2,
                }}>
                  <Text numberOfLines={1} style={{
                    flexShrink: 0, fontFamily: font.bold, color: palette.forest, fontSize: 12,
                  }}>Buka</Text>
                  <ArrowUpRight size={16} color={palette.forest} />
                </View>
          </View>
        </View>
      </View>
    </Pressable>
      <Pressable onPress={(event)=>{event.stopPropagation();onToggleSave();}} accessibilityRole="button"
        accessibilityLabel={saved ? `Hapus ${route.name} dari simpanan` : `Simpan ${route.name}`}
        accessibilityState={{ selected: saved }} hitSlop={8}
        style={({ pressed }) => ({
          position: 'absolute', right: 9, top: 9, width: 42, height: 42,
          alignItems: 'center', justifyContent: 'center', borderRadius: radius.small,
          backgroundColor: saved ? palette.pale : 'rgba(255,255,255,.92)',
          opacity: pressed ? .65 : 1,
        })}>
        {saved ? <Check size={19} color={palette.pine}/> : <Bookmark size={19} color={palette.pine}/>}
      </Pressable>
    </View>
  );
}
