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
import { formatDateDot } from '../../utils/format';

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

        {/* ── Hero ── */}
        <View style={styles.heroBlock}>
          <Text style={styles.heroText}>
            {t('home.heroLine1')}{' \n'}
            <Text style={styles.heroNormal}>{t('home.heroLine2')}</Text>
            <Text style={styles.heroAccent}>{t('home.heroAccent')}</Text>
          </Text>
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

        {/* ── 다가오는 예약 ── */}
        {upcomingBooking && (
          <TouchableOpacity
            style={styles.upcomingCard}
            onPress={() => router.push('/(tabs)/bookings')}
            activeOpacity={0.9}
          >
            <View style={styles.upcomingIconWrap}>
              <Ionicons name="bed-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingLabel}>{t('home.upcomingBooking')}</Text>
              <Text style={styles.upcomingName} numberOfLines={1}>{upcomingBooking.hotelName}</Text>
              <Text style={styles.upcomingDate}>
                {formatDateDot(upcomingBooking.checkIn)} {'→'} {formatDateDot(upcomingBooking.checkOut)}
              </Text>
            </View>
            <View style={styles.upcomingRight}>
              <View style={styles.upcomingBadge}>
                <Text style={styles.upcomingBadgeText}>{t('home.confirmed')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── 베스트 여행지 ── */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/(tabs)/explore')}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>{t('home.topDestinations')}</Text>
              <Text style={styles.sectionSub}>베트남 인기 여행지 모음</Text>
            </View>
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

        {/* ── AI 일정 플래너 ── */}
        <View style={styles.aiBannerWrap}>
          <AIPlannerBanner onPress={() => router.push('/ai-planner')} />
        </View>

        {/* ── 추천 숙소 ── */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/hotel')}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>{t('home.recommendedHotels')}</Text>
              <Text style={styles.sectionSub}>베트남 최고 인기 숙소</Text>
            </View>
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

        {/* ── 항공 특가 ── */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/flights')}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>{t('home.flightDeals')}</Text>
              <Text style={styles.sectionSub}>인천 출발 최저가 항공권</Text>
            </View>
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
    paddingBottom: Spacing.xs,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: FontSize.sm, fontWeight: '700', color: '#FFF' },
  greetingSmall:  { fontSize: FontSize.xs, color: Colors.textMuted },
  greetingName:   { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },

  // ── Hero ──
  heroBlock: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  heroText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  heroNormal: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heroAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },

  // ── Search ──
  searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.base },

  // ── Upcoming Booking ──
  upcomingCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    ...Shadow.sm,
  },
  upcomingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingInfo: { flex: 1 },
  upcomingLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 1 },
  upcomingName:  { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  upcomingDate:  { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  upcomingRight: { alignItems: 'center', gap: 4 },
  upcomingBadge: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  upcomingBadgeText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700' },

  // ── Sections ──
  sectionWrap:       { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitleBlock: { gap: 2 },
  sectionTitle:  { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  sectionSub:    { fontSize: FontSize.xs, color: Colors.textMuted },
  sectionAction: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  hListPad:      { paddingHorizontal: Spacing.base, gap: Spacing.md },

  // ── AI Banner wrapper ──
  aiBannerWrap: { marginBottom: Spacing['2xl'] },

  // ── Transport Cards ──
  transportCard: {
    width: 108,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transportIcon:  { fontSize: 28 },
  transportTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  transportSub: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  });
}
