import {
  LayoutDashboard,
  Map,
  MapPin,
  Lightbulb,
  AppWindow,
  Building2,
  BedDouble,
  Wifi,
  Star,
  Car,
  Clock,
  MapPinned,
  ClipboardList,
  CalendarDays,
  Heart,
  Users,
  Settings,
  Image,
  Bot,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Destinations',
    items: [
      { path: '/destinations', label: 'Destinations', icon: Map },
      { path: '/places', label: 'Places', icon: MapPin },
      { path: '/destination-tips', label: 'Destination Tips', icon: Lightbulb },
      { path: '/essential-apps', label: 'Essential Apps', icon: AppWindow },
    ],
  },
  {
    label: 'Hotels',
    items: [
      { path: '/hotels', label: 'Hotels', icon: Building2 },
      { path: '/hotel-rooms', label: 'Hotel Rooms', icon: BedDouble },
      { path: '/hotel-amenities', label: 'Hotel Amenities', icon: Wifi },
      { path: '/hotel-reviews', label: 'Hotel Reviews', icon: Star },
    ],
  },
  {
    label: 'Transport',
    items: [
      { path: '/transports', label: 'Transports', icon: Car },
      { path: '/transport-duration-options', label: 'Duration Options', icon: Clock },
      { path: '/transport-pickup-options', label: 'Pickup Options', icon: MapPinned },
    ],
  },
  {
    label: 'Bookings',
    items: [
      { path: '/bookings', label: 'Bookings', icon: ClipboardList },
      { path: '/itineraries', label: 'Itineraries', icon: CalendarDays },
      { path: '/favorites', label: 'Favorites', icon: Heart },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: '/users', label: 'Users', icon: Users },
      { path: '/settings', label: 'App Settings', icon: Settings },
      { path: '/media-uploads', label: 'Media Uploads', icon: Image },
      { path: '/ai-logs', label: 'AI Logs', icon: Bot },
    ],
  },
];

// Flat list derived from NAV_GROUPS — used by Header for title lookup
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const ACCESS_TOKEN_KEY = 'cms_access_token';
export const REFRESH_TOKEN_KEY = 'cms_refresh_token';
