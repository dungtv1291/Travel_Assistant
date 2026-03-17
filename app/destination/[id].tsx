import React, { useEffect, useState , useMemo} from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Dimensions, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

import { destinationsService } from '../../services/mock/destinations.service';
import { hotelsService } from '../../services/mock/hotels.service';
import { useTripsStore } from '../../store/trips.store';
import { Destination, Attraction } from '../../types/destination.types';
import { Hotel } from '../../types/hotel.types';
import { Rating } from '../../components/common/Rating';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { useTranslation } from '../../hooks/useTranslation';
import { formatVNDPrice, formatKRWPrice } from '../../utils/format';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 320;

const SECTION_TAB_KEYS = ['overview', 'attractions', 'hotels', 'weather', 'tips'] as const;

export default function DestinationDetailScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite, isFavorite } = useTripsStore();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [destHotels, setDestHotels] = useState<Hotel[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        destinationsService.getById(id),
        destinationsService.getAttractionsByDestination(id),
        hotelsService.getByDestination(id),
      ]).then(([dest, attrs, htls]) => {
        setDestination(dest || null);
        setAttractions(attrs);
        setDestHotels(htls);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <LoadingState message={t('destination.loading')} />;
  if (!destination) return <LoadingState message={t('destination.notFound')} />;

  const fav = isFavorite(destination.id);

  const handleShare = async () => {
    await Share.share({
      message: `${destination.nameKo} - 베트남 여행 추천! 📍 ${destination.region}, ${destination.country}`,
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroContainer}>
            <Image source={{ uri: destination.imageUrl }} style={styles.heroImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.heroGradient}
            />
            {/* Back / Actions */}
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.heroRightBtns}>
                  <TouchableOpacity style={styles.heroBtn} onPress={handleShare}>
                    <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroBtn} onPress={() => toggleFavorite(destination.id)}>
                    <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? Colors.error : '#FFFFFF'} />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
            {/* Hero Info */}
            <View style={styles.heroInfo}>
              <View style={styles.heroBadges}>
                {destination.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} label={tag} variant="primary" size="sm" />
                ))}
              </View>
              <Text style={styles.heroName}>{destination.nameKo}</Text>
              <Text style={styles.heroRegion}>📍 {destination.region}, {destination.country}</Text>
              <View style={styles.heroStats}>
                <Rating value={destination.rating} reviewCount={destination.reviewCount} size="sm" />
                <Text style={styles.heroVisitors}>
                  🇰🇷 {t('destination.visitors', { count: (destination.popularityKorean ?? 0).toLocaleString() })}
                </Text>
              </View>
            </View>
          </View>

          {/* Section Tabs */}
          <View style={styles.tabsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
              {SECTION_TAB_KEYS.map((key, i) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.tab, activeTab === i && styles.tabActive]}
                  onPress={() => setActiveTab(i)}
                >
                  <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t(`destination.${key}`)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* 개요 Tab */}
            {activeTab === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('destination.about')}</Text>
                <Text style={styles.description}>{destination.descriptionKo}</Text>
                {destination.longDescriptionKo && (
                  <Text style={styles.description}>{destination.longDescriptionKo}</Text>
                )}

                {/* Quick Info */}
                <View style={styles.infoGrid}>
                  {[
                    { icon: 'calendar-outline', label: t('destination.bestSeason'), value: destination.bestSeason ?? destination.bestTimeToVisit },
                    { icon: 'thermometer-outline', label: t('destination.avgTemp'), value: `${destination.weather.temperature}°C` },
                    { icon: 'language-outline', label: t('destination.language'), value: t('destination.languageValue') },
                    { icon: 'card-outline', label: t('destination.currency'), value: t('destination.currencyValue') },
                  ].map(info => (
                    <View key={info.label} style={styles.infoCard}>
                      <Ionicons name={info.icon as any} size={20} color={Colors.primary} />
                      <Text style={styles.infoLabel}>{info.label}</Text>
                      <Text style={styles.infoValue}>{info.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Tags */}
                <Text style={styles.sectionTitle}>{t('destination.recommendedActivities')}</Text>
                <View style={styles.tagList}>
                  {destination.tags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 명소 Tab */}
            {activeTab === 1 && (
              <View style={styles.section}>
                {attractions.length === 0 ? (
                  <Text style={styles.emptyText}>{t('destination.noAttractions')}</Text>
                ) : (
                  attractions.map(attr => (
                    <View key={attr.id} style={styles.attractionCard}>
                      <Image source={{ uri: attr.imageUrl }} style={styles.attrImage} />
                      <View style={styles.attrContent}>
                        <Text style={styles.attrName}>{attr.nameKo}</Text>
                        <Text style={styles.attrCategory}>{attr.category}</Text>
                        <Text style={styles.attrDescription} numberOfLines={2}>{attr.descriptionKo ?? attr.description}</Text>
                        {attr.ticketPrice && (
                          <Text style={styles.attrPrice}>
                            {t('destination.entranceFee')}: {formatVNDPrice(attr.ticketPrice.adult)}
                          </Text>
                        )}
                        <View style={styles.attrFooter}>
                          <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                          <Text style={styles.attrDuration}>{t('destination.hoursSpent', { h: attr.duration ?? attr.suggestedDuration })}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* 호텔 Tab */}
            {activeTab === 2 && (
              <View style={styles.section}>
                {destHotels.length > 0 ? (
                  <>
                    {destHotels.slice(0, 3).map(hotel => (
                      <TouchableOpacity
                        key={hotel.id}
                        style={styles.miniHotelCard}
                        onPress={() => router.push(`/hotel/${hotel.id}` as never)}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: hotel.imageUrl }} style={styles.miniHotelImage} />
                        <View style={styles.miniHotelInfo}>
                          <Text style={styles.miniHotelName} numberOfLines={1}>{hotel.nameKo}</Text>
                          <View style={styles.miniHotelRatingRow}>

                            {[...Array(hotel.starRating ?? 0)].map((_, si) => (
                              <Ionicons key={si} name="star" size={11} color="#FBBF24" />
                            ))}
                            <Text style={styles.miniHotelRating}>{hotel.rating.toFixed(1)}</Text>
                            <Text style={styles.miniHotelReviews}>({hotel.reviewCount.toLocaleString()})</Text>
                          </View>
                          <Text style={styles.miniHotelPrice}>
                            {formatKRWPrice(hotel.pricePerNight)} <Text style={styles.miniHotelPerNight}>/박</Text>
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                    <Button
                      title={t('destination.searchHotels', { name: destination.nameKo })}
                      onPress={() => router.push('/hotel')}
                      variant="outline"
                      fullWidth
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.description}>
                      {t('destination.hotelHint', { name: destination.nameKo })}
                    </Text>
                    <Button
                      title={t('destination.searchHotels', { name: destination.nameKo })}
                      onPress={() => router.push('/hotel')}
                      size="lg"
                      fullWidth
                    />
                  </>
                )}
              </View>
            )}

            {/* 날씨 Tab */}
            {activeTab === 3 && (
              <View style={styles.section}>
                {/* Current Weather Card */}
                <View style={styles.weatherCard}>
                  <View style={styles.weatherMainRow}>
                    <View>
                      <Text style={styles.weatherTemp}>{destination.weather.temperature}°C</Text>
                      <Text style={styles.weatherCondition}>{destination.weather.description || destination.weather.condition}</Text>
                    </View>
                    <Text style={styles.weatherIcon}>{destination.weather.icon ?? '🌤️'}</Text>
                  </View>
                  <View style={styles.weatherStats}>
                    <View style={styles.weatherStatItem}>
                      <Ionicons name="water-outline" size={18} color={Colors.primary} />
                      <Text style={styles.weatherStatValue}>{destination.weather.humidity}%</Text>
                      <Text style={styles.weatherStatLabel}>{t('destination.humidity')}</Text>
                    </View>
                    <View style={styles.weatherStatDivider} />
                    <View style={styles.weatherStatItem}>
                      <Ionicons name="umbrella-outline" size={18} color={Colors.primary} />
                      <Text style={styles.weatherStatValue}>{destination.weather.rainfall ?? 0}mm</Text>
                      <Text style={styles.weatherStatLabel}>{t('destination.rainfall')}</Text>
                    </View>
                    <View style={styles.weatherStatDivider} />
                    <View style={styles.weatherStatItem}>
                      <Ionicons name="sunny-outline" size={18} color="#F59E0B" />
                      <Text style={styles.weatherStatValue}>
                        {destination.weather.temperature >= 32 ? '자외선 강함' : destination.weather.temperature >= 26 ? '자외선 보통' : '자외선 약함'}
                      </Text>
                      <Text style={styles.weatherStatLabel}>자외선</Text>
                    </View>
                  </View>
                </View>

                {/* Best Time to Visit */}
                <View style={styles.bestTimeCard}>
                  <View style={styles.bestTimeHeader}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                    <Text style={styles.bestTimeTitle}>{t('destination.bestSeason')}</Text>
                  </View>
                  <Text style={styles.bestTimeValue}>
                    {destination.bestSeason ?? destination.bestTimeToVisit}
                  </Text>
                  <Text style={styles.bestTimeHint}>
                    이 시기에는 날씨가 좋고 여행하기 최적입니다. 성수기에는 사전 예약이 필수입니다.
                  </Text>
                </View>

                {/* Season Overview */}
                <View style={styles.seasonCard}>
                  <Text style={styles.seasonTitle}>계절 개요</Text>
                  <View style={styles.seasonRow}>
                    {[
                      { label: '봄', months: '3-5월', icon: '🌸', note: '여행 적기' },
                      { label: '여름', months: '6-8월', icon: '☀️', note: '성수기' },
                      { label: '가을', months: '9-11월', icon: '🍂', note: '여행 적기' },
                      { label: '겨울', months: '12-2월', icon: '❄️', note: '건기' },
                    ].map(season => (
                      <View key={season.label} style={styles.seasonItem}>
                        <Text style={styles.seasonIcon}>{season.icon}</Text>
                        <Text style={styles.seasonLabel}>{season.label}</Text>
                        <Text style={styles.seasonMonths}>{season.months}</Text>
                        <Text style={styles.seasonNote}>{season.note}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 여행 팁 Tab */}
            {activeTab === 4 && (
              <View style={styles.section}>
                {(destination.travelTipsKo ?? [
                  '현금을 충분히 준비하세요.',
                  '영어보다 베트남어 기본 인사로 현지인에게 친근감을 표하세요.',
                  '스마트폰에 오프라인 지도를 다운로드하세요.',
                  '물은 반드시 생수를 구입하세요.',
                  '그랩(Grab) 앱을 설치하면 편리하게 이동할 수 있습니다.',
                ]).map((tip: string, i: number) => (
                  <View key={i} style={styles.tipItem}>
                    <View style={styles.tipNum}>
                      <Text style={styles.tipNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.bottomBarInner}>
            <Button
              title={t('destination.aiItinerary')}
              onPress={() => router.push('/ai-planner')}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title={t('destination.bookHotel')}
              onPress={() => router.push('/hotel')}
              style={{ flex: 1 }}
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  heroContainer: { height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width, height: HERO_HEIGHT, resizeMode: 'cover' },
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
  },
  heroSafeArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  heroBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRightBtns: { flexDirection: 'row', gap: Spacing.sm },
  heroInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  heroBadges: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  heroName: { fontSize: FontSize['2xl'], fontWeight: '800', color: '#FFFFFF' },
  heroRegion: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  heroVisitors: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)' },

  tabsRow: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderColor: Colors.border },
  tabsContent: { paddingHorizontal: Spacing.base, gap: Spacing.xs },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },

  content: { padding: Spacing.base },
  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  infoCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
  },
  tagText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },

  attractionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  attrImage: { width: 100, height: 110 },
  attrContent: { flex: 1, padding: Spacing.md, gap: 3 },
  attrName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  attrCategory: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  attrDescription: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },
  attrPrice: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.accent },
  attrFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  attrDuration: { fontSize: FontSize.xs, color: Colors.textMuted },

  weatherCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.sm,
    gap: Spacing.md,
  },
  weatherMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherTemp: { fontSize: 52, fontWeight: '800', color: Colors.primary },
  weatherCondition: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 2 },
  weatherIcon: { fontSize: 56 },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  weatherStatItem: { alignItems: 'center', gap: Spacing.xs },
  weatherStatValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  weatherStatLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  weatherStatDivider: { width: 1, height: '60%', backgroundColor: Colors.border, alignSelf: 'center' },

  bestTimeCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  bestTimeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  bestTimeTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  bestTimeValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  bestTimeHint: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },

  seasonCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    ...Shadow.sm,
    gap: Spacing.md,
  },
  seasonTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  seasonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  seasonItem: { flex: 1, alignItems: 'center', gap: 3 },
  seasonIcon: { fontSize: 24 },
  seasonLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  seasonMonths: { fontSize: FontSize.xs, color: Colors.textMuted },
  seasonNote: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  miniHotelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
    gap: Spacing.md,
  },
  miniHotelImage: { width: 88, height: 80 },
  miniHotelInfo: { flex: 1, gap: 3, paddingVertical: Spacing.sm },
  miniHotelName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  miniHotelRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniHotelRating: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  miniHotelReviews: { fontSize: FontSize.xs, color: Colors.textMuted },
  miniHotelPrice: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  miniHotelPerNight: { fontSize: FontSize.xs, fontWeight: '400', color: Colors.textMuted },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  tipNum: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipNumText: { fontSize: FontSize.sm, fontWeight: '700', color: '#FFFFFF' },
  tipText: { flex: 1, fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },

  bottomBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  bottomBarInner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  });
}
