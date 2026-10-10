import type {ComponentProps,ComponentType} from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Centralized Material Icons palette. Old semantic names remain temporarily to
// keep feature components readable while all glyphs render from Material Icons.
type Props=Omit<ComponentProps<typeof MaterialIcons>,'name'> & {strokeWidth?:number};
export type AppIcon=ComponentType<Props>;
type MaterialName=ComponentProps<typeof MaterialIcons>['name'];
function icon(name:MaterialName):AppIcon {
 return function MaterialGlyph({strokeWidth,...props}:Props) {
  void strokeWidth;
  return <MaterialIcons name={name} {...props}/>;
 };
}

export const AlertTriangle=icon('warning-amber');
export const ArrowUpRight=icon('north-east');
export const BarChart3=icon('bar-chart');
export const Bike=icon('directions-bike');
export const Bookmark=icon('bookmark-border');
export const BookmarkCheck=icon('bookmark-added');
export const CalendarDays=icon('event');
export const Check=icon('check');
export const CheckCircle2=icon('check-circle');
export const ChevronLeft=icon('chevron-left');
export const ChevronRight=icon('chevron-right');
export const ClipboardList=icon('assignment');
export const Clock3=icon('access-time');
export const Coffee=icon('local-cafe');
export const Compass=icon('explore');
export const Crosshair=icon('my-location');
export const ExternalLink=icon('open-in-new');
export const Flag=icon('outlined-flag');
export const Footprints=icon('directions-run');
export const Gift=icon('card-giftcard');
export const Heart=icon('favorite-border');
export const Image=icon('image');
export const Info=icon('info-outline');
export const Map=icon('map');
export const MapPin=icon('place');
export const MapPinned=icon('pin-drop');
export const MessagesSquare=icon('forum');
export const Minus=icon('remove');
export const Mountain=icon('terrain');
export const Pause=icon('pause');
export const Play=icon('play-arrow');
export const Plus=icon('add');
export const RotateCcw=icon('replay');
export const Route=icon('alt-route');
export const Search=icon('search');
export const Send=icon('send');
export const ShieldAlert=icon('warning');
export const SlidersHorizontal=icon('tune');
export const Sparkles=icon('auto-awesome');
export const Store=icon('storefront');
export const Sun=icon('wb-sunny');
export const Tag=icon('local-offer');
export const Ticket=icon('confirmation-number');
export const Trophy=icon('emoji-events');
export const Users=icon('groups');
export const X=icon('close');
