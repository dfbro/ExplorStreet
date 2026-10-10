import { View } from 'react-native';
import { Bike, Footprints } from '@/components/icons';
import type { RouteInfo } from '@/features/routes/model';
import { palette } from '@/theme/tokens';

export function RouteArtwork({ accent, sport, width = 96, height = 116 }: {
  accent: RouteInfo['accent'];
  sport: RouteInfo['sport'];
  width?: number;
  height?: number;
}) {
  const background = accent === 'gold' ? '#FAEACD' : accent === 'sky' ? '#DDEFEA' : '#E0F0D8';
  const Icon = sport === 'bike' ? Bike : Footprints;

  return (
    <View
      accessible={false}
      style={{
        width,
        height,
        borderRadius: 18,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <View style={{
        width: Math.min(width - 16, 76),
        height: Math.min(width - 16, 76),
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={48} color={palette.forest} />
      </View>
    </View>
  );
}
