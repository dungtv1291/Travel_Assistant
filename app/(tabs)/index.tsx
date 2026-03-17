import React, { useEffect, useState , useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

import { useAuthStore } from '../../store/auth.store';
import { useTripsStore } from '../../store/trips.store';
import { useBookingsStore } from '../../store/bookings.store';
import { useTranslation } from '../../hooks/useTranslation';

import { destinationsService } from '../../services/mock/destinations.service';
import { hotelsService } from '../../services/mock/hotels.service';
import { flightsService } from '../../services/mock/flights.service';

import { Destination } from '../../types/destination.types';
import { Hotel } from '../../types/hotel.types';
import { Flight } from '../../types/flight.types';

import { SearchBar } from '../../components/common/SearchBar';
import { FeaturedDestinationCard } from '../../components/home/FeaturedDestinationCard';
import { HotelCard } from '../../components/home/HotelCard';
import { CategoryGrid } from '../../components/home/CategoryGrid';
import { FlightDealCard } from '../../components/home/FlightDealCard';
import { AIPlannerBanner } from '../../components/home/AIPlannerBanner';

const DEAL_BADGES = ['32%', '28%', '35%', '24%', '30%'];

export default function HomeScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { user } = useAuthStore();
  const { toggleFavorite, isFavorite } = useTripsStore();
  const { hotelBookings } = useBookingsStore();
  const { t } = useTranslation();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [dests, htls, fls] = await Promise.all([
      destinationsService.getFeatured(),
      hotelsService.getRecommended(),
      flightsService.getDeals(),
    ]);
    setDestinations(dests);
    setHotels(htls);
    setFlights(fls);
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const upcomingBooking = hotelBookings[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarRow}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() ?? 'K'}</Text>
              </View>
            )}
            <View>
              <Text style={styles.greetingSmall}>{t('home.greeting')}</Text>
              <Text style={styles.greetingName}>{t('home.greetingName', { name: user?.nameKo ?? user?.name ?? t('home.traveler') })}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Title ── */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroLine}>{t('home.heroLine1')}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroLine}>{t('home.heroLine2')}</Text>
            <Text style={styles.heroAccent}>{t('home.heroAccent')}</Text>
          </View>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder={t('home.searchPlaceholder')}
            editable={false}
            onPress={() => router.push('/(tabs)/explore')}
          />
        </View>

        {/* ── Category Icons ── */}
        <CategoryGrid router={router} />

        {/* ── Upcoming Booking Card ── */}
        {upcomingBooking && (
          <TouchableOpacity
            style={styles.upcomingCard}
            onPress={() => router.push('/(tabs)/bookings')}
            activeOpacity={0.9}
          >
            <View style={styles.upcomingIconWrap}>
              <Ionicons name="bed-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingLabel}>{t('home.upcomingBooking')}</Text>
              <Text style={styles.upcomingName} numberOfLines={1}>{upcomingBooking.hotelName}</Text>
              <Text style={styles.upcomingDate}>{upcomingBooking.checkIn} → {upcomingBooking.checkOut}</Text>
            </View>
            <View style={styles.upcomingRight}>
              <View style={styles.upcomingBadge}>
                <Text style={styles.upcomingBadgeText}>{t('home.confirmed')}</Text>
              </View>
              <Text style={styles.confirmCode} numberOfLines={1}>{upcomingBooking.confirmationCode}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Best Destinations ── */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.sectionTitle}>{t('home.topDestinations')}</Text>
            <Text style={styles.sectionAction}>{t('common.viewAll')}</Text>
          </TouchableOpacity>
          <FlatList
            horizontal
            data={destinations}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
            renderItem={({ item, index }) => (
              <FeaturedDestinationCard
                destination={item}
                onPress={() => router.push(`/destination/${item.id}` as never)}
                isFavorite={isFavorite(item.id)}
                onFavoriteToggle={() => toggleFavorite(item.id)}
                dealBadge={DEAL_BADGES[index % DEAL_BADGES.length]}
              />
            )}
          />
        </View>

        {/* ── Hotel Recommendations ── */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/hotel')}>
            <Text style={styles.sectionTitle}>{t('home.recommendedHotels')}</Text>
            <Text style={styles.sectionAction}>{t('common.viewAll')}</Text>
          </TouchableOpacity>
          <FlatList
            horizontal
            data={hotels.slice(0, 5)}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
            renderItem={({ item }) => (
              <HotelCard hotel={item} onPress={() => router.push(`/hotel/${item.id}` as never)} />
            )}
          />
        </View>

        {/* -- AI Planner Banner -- */}
        <View style={styles.sectionWrap}>
          <AIPlannerBanner onPress={() => router.push('/ai-planner')} />
        </View>

        {/* -- Best Flight Deals -- */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/flights')}>
            <Text style={styles.sectionTitle}>{t('home.flightDeals')}</Text>
            <Text style={styles.sectionAction}>{t('common.viewAll')}</Text>
          </TouchableOpacity>
          <FlatList
            horizontal
            data={flights}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
            renderItem={({ item }) => (
              <FlightDealCard
                flight={item}
                onPress={() => router.push('/flights')}
              />
            )}
          />
        </View>

        {/* ── Transport Quick Links ── */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/transport')}>
            <Text style={styles.sectionTitle}>{t('home.transportRental')}</Text>
            <Text style={styles.sectionAction}>{t('common.viewAll')}</Text>
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
          >
            {[
              { icon: '🛬', titleKey: 'home.transportAirport', subKey: 'home.transportAirportSub', bg: Colors.primaryLight },
              { icon: '🚗', titleKey: 'home.transportPrivate', subKey: 'home.transportPrivateSub', bg: '#DCFCE7' },
              { icon: '🛵', titleKey: 'home.transportScooter', subKey: 'home.transportScooterSub', bg: '#FEF3C7' },
              { icon: '🚌', titleKey: 'home.transportDayTour', subKey: 'home.transportDayTourSub', bg: Colors.accentLight },
            ].map(item => (
              <TouchableOpacity
                key={item.titleKey}
                style={[styles.transportCard, { backgroundColor: item.bg }]}
                onPress={() => router.push('/transport')}
                activeOpacity={0.8}
              >
                <Text style={styles.transportIcon}>{item.icon}</Text>
                <Text style={styles.transportTitle}>{t(item.titleKey as any)}</Text>
                <Text style={styles.transportSub}>{t(item.subKey as any)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: FontSize.base, fontWeight: '700', color: '#FFF' },
  greetingSmall: { fontSize: FontSize.xs, color: Colors.textMuted },
  greetingName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },

  // ── Hero Title ──
  heroBlock: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap' },
  heroLine: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  heroAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -0.5,
    lineHeight: 36,
  },

  // ── Search ──
  searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },

  // ── Upcoming Booking ──
  upcomingCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    ...Shadow.md,
  },
  upcomingIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingInfo: { flex: 1 },
  upcomingLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  upcomingName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  upcomingDate: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  upcomingRight: { alignItems: 'flex-end', gap: 4 },
  upcomingBadge: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  upcomingBadgeText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '600' },
  confirmCode: { fontSize: FontSize.xs, color: Colors.textMuted, maxWidth: 80 },

  // ── Sections ──
  sectionWrap: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  sectionAction: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  hListPad: { paddingHorizontal: Spacing.base, gap: Spacing.md },

  // ── AI Banner ──
  aiBanner: {
    marginHorizontal: Spacing.base,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aiIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiEmoji: { fontSize: 24 },
  aiText: { flex: 1 },
  aiTitle: { fontSize: FontSize.base, fontWeight: '700', color: '#FFFFFF' },
  aiSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // ── Transport Cards ──
  transportCard: {
    width: 104,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transportIcon: { fontSize: 30 },
  transportTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  transportSub: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  });
}
