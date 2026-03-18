import React, { useEffect, useState , useMemo} from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Share,
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
import { useFormatter } from '../../hooks/useFormatter';
import { HeroImage, HeroButton, DetailTabBar } from '../../components/ui';

const HERO_HEIGHT = 320;

const SECTION_TAB_KEYS = ['overview', 'attractions', 'hotels', 'weather', 'tips'] as const;

const ATTR_CAT_KEYS: Record<string, string> = {
  heritage: 'destination.attrCat.heritage',
  nature: 'destination.attrCat.nature',
  beach: 'destination.attrCat.beach',
  temple: 'destination.attrCat.temple',
  market: 'destination.attrCat.market',
  museum: 'destination.attrCat.museum',
  food: 'destination.attrCat.food',
  entertainment: 'destination.attrCat.entertainment',
};

const PACK_ICONS = ['🧴', '💊', '🔌', '💵', '🧢', '💧'];

export default function DestinationDetailScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { formatPrice } = useFormatter();
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
          <HeroImage
            imageUrl={destination.imageUrl}
            height={HERO_HEIGHT}
            onBack={() => router.back()}
            rightActions={
              <>
                <HeroButton onPress={handleShare}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                </HeroButton>
                <HeroButton onPress={() => toggleFavorite(destination.id)}>
                  <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? Colors.error : '#FFFFFF'} />
                </HeroButton>
              </>
            }
          >
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
          </HeroImage>

          {/* Section Tabs */}
          <DetailTabBar
            tabs={SECTION_TAB_KEYS.map(k => t(`destination.${k}`))}
            activeIndex={activeTab}
            onChange={setActiveTab}
            scrollable
          />

          {/* Content */}
          <View style={styles.content}>
            {/* 개요 Tab */}
            {activeTab === 0 && (
              <View style={styles.section}>

                {/* Rating + popularity strip */}
                <View style={styles.ratingStrip}>
                  <View style={styles.ratingStripLeft}>
                    <Text style={styles.ratingBig}>{destination.rating.toFixed(1)}</Text>
                    <View style={styles.starsRow}>
                      {[1,2,3,4,5].map(s => (
                        <Ionicons
                          key={s}
                          name={s <= Math.round(destination.rating) ? 'star' : 'star-outline'}
                          size={14}
                          color="#FBBF24"
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingCount}>{t('destination.reviewsTotal', { count: destination.reviewCount.toLocaleString() })}</Text>
                  </View>
                  <View style={styles.ratingStripRight}>
                    <Text style={styles.popularityLabel}>{t('destination.popularity')}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${destination.popularityScore}%` }]} />
                    </View>
                    <Text style={styles.popularityNum}>{destination.popularityScore} / 100</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.description}>{destination.descriptionKo}</Text>
                {destination.longDescriptionKo && (
                  <Text style={styles.description}>{destination.longDescriptionKo}</Text>
                )}

                {/* Quick Info grid */}
                <Text style={styles.sectionHead}>{t('destination.basicInfo')}</Text>
                <View style={styles.infoGrid}>
                  {[
                    { icon: 'calendar-outline', label: t('destination.bestSeason'), value: destination.bestSeason ?? destination.bestTimeToVisit, color: Colors.primary },
                    { icon: 'thermometer-outline', label: t('destination.avgTemp'), value: `${destination.weather.temperature}°C`, color: '#EF4444' },
                    { icon: 'language-outline', label: t('destination.language'), value: t('destination.languageValue'), color: '#8B5CF6' },
                    { icon: 'card-outline', label: t('destination.currency'), value: t('destination.currencyValue'), color: Colors.accent },
                  ].map(info => (
                    <View key={info.label} style={styles.infoCard}>
                      <View style={[styles.infoIconWrap, { backgroundColor: (info.color as string) + '18' }]}>
                        <Ionicons name={info.icon as any} size={18} color={info.color as string} />
                      </View>
                      <Text style={styles.infoLabel}>{info.label}</Text>
                      <Text style={styles.infoValue}>{info.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Tags */}
                <Text style={styles.sectionHead}>{t('destination.recommendedTags')}</Text>
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
                    <View key={attr.id} style={styles.attrCard}>
                      <Image source={{ uri: attr.imageUrl }} style={styles.attrImage} />
                      <View style={styles.attrBody}>

                        {/* Category + Korean popular badge */}
                        <View style={styles.attrTopRow}>
                          <View style={styles.attrCatPill}>
                            <Text style={styles.attrCatText}>{ATTR_CAT_KEYS[attr.category] ? t(ATTR_CAT_KEYS[attr.category] as any) : attr.category}</Text>
                          </View>
                          {attr.isPopularWithKoreans && (
                            <View style={styles.koreanBadge}>
                              <Text style={styles.koreanBadgeText}>{t('destination.koreanPopular')}</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.attrName}>{attr.nameKo}</Text>

                        {(attr.descriptionKo || attr.description) ? (
                          <Text style={styles.attrDesc} numberOfLines={2}>
                            {attr.descriptionKo ?? attr.description}
                          </Text>
                        ) : null}

                        {/* Rating */}
                        <View style={styles.attrRatingRow}>
                          <Ionicons name="star" size={12} color="#FBBF24" />
                          <Text style={styles.attrRatingNum}>{attr.rating.toFixed(1)}</Text>
                          <Text style={styles.attrRatingCount}>({attr.reviewCount.toLocaleString()})</Text>
                        </View>

                        {/* Duration + ticket price */}
                        <View style={styles.attrFooterRow}>
                          <View style={styles.attrDurationPill}>
                            <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
                            <Text style={styles.attrDurationText}>{attr.duration ?? attr.suggestedDuration}</Text>
                          </View>
                          {attr.ticketPrice && attr.ticketPrice.adult > 0 ? (
                            <View style={styles.attrPricePill}>
                              <Text style={styles.attrPriceText}>{formatPrice(attr.ticketPrice.adult, 'VND')}</Text>
                            </View>
                          ) : (
                            <View style={styles.attrFreePill}>
                              <Text style={styles.attrFreeText}>{t('destination.freeEntry')}</Text>
                            </View>
                          )}
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
                    {/* Section header */}
                    <View style={styles.hotelSectionHead}>
                      <Text style={styles.hotelSectionTitle}>{t('destination.hotelCountSection', { name: destination.nameKo })}</Text>
                      <View style={styles.hotelCountBadge}>
                        <Text style={styles.hotelCountText}>{t('destination.hotelCountBadge', { count: destHotels.length })}</Text>
                      </View>
                    </View>

                    {destHotels.slice(0, 4).map(hotel => (
                      <TouchableOpacity
                        key={hotel.id}
                        style={styles.hotelCard}
                        onPress={() => router.push(`/hotel/${hotel.id}` as never)}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: hotel.imageUrl }} style={styles.hotelImg} />
                        <View style={styles.hotelInfo}>
                          <View style={styles.hotelStarsRow}>
                            {[...Array(hotel.starRating ?? 0)].map((_, si) => (
                              <Ionicons key={si} name="star" size={11} color="#FBBF24" />
                            ))}
                          </View>
                          <Text style={styles.hotelName} numberOfLines={1}>{hotel.nameKo}</Text>
                          <View style={styles.hotelRatingRow}>
                            <View style={styles.hotelRatingBadge}>
                              <Text style={styles.hotelRatingNum}>{hotel.rating.toFixed(1)}</Text>
                            </View>
                            <Text style={styles.hotelRatingDesc}>
                              {hotel.rating >= 4.7 ? t('destination.ratingExcellent') : hotel.rating >= 4.3 ? t('destination.ratingGreat') : t('destination.ratingGood')}
                            </Text>
                            <Text style={styles.hotelReviews}>· {t('destination.hotelReviews', { count: hotel.reviewCount.toLocaleString() })}</Text>
                          </View>
                          <View style={styles.hotelPriceRow}>
                            <Text style={styles.hotelPrice}>{formatPrice(hotel.pricePerNight)}</Text>
                            <Text style={styles.hotelPerNight}>{t('destination.perNight')}</Text>
                          </View>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={Colors.textMuted}
                          style={{ alignSelf: 'center', marginRight: Spacing.sm }}
                        />
                      </TouchableOpacity>
                    ))}

                    <Button
                      title={t('destination.allHotels', { name: destination.nameKo })}
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
                {/* Current weather — gradient hero card */}
                <LinearGradient
                  colors={[Colors.primary, '#148FA0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.weatherHeroCard}
                >
                  <Text style={styles.weatherDestLabel}>{t('destination.currentWeather')} — {destination.nameKo}</Text>
                  <View style={styles.weatherHeroTop}>
                    <View>
                      <Text style={styles.weatherTempHero}>{destination.weather.temperature}°C</Text>
                      <Text style={styles.weatherCondHero}>
                        {destination.weather.description || destination.weather.condition}
                      </Text>
                    </View>
                    <Text style={styles.weatherIconHero}>{destination.weather.icon ?? '🌤️'}</Text>
                  </View>
                  <View style={styles.weatherHeroStats}>
                    <View style={styles.weatherHeroStat}>
                      <Text style={styles.weatherHeroStatNum}>{destination.weather.humidity}%</Text>
                      <Text style={styles.weatherHeroStatLabel}>{t('destination.humidity')}</Text>
                    </View>
                    <View style={styles.weatherHeroStatDivider} />
                    <View style={styles.weatherHeroStat}>
                      <Text style={styles.weatherHeroStatNum}>{t('destination.rainfallAmount', { amount: destination.weather.rainfall ?? 0 })}</Text>
                      <Text style={styles.weatherHeroStatLabel}>{t('destination.rainfall')}</Text>
                    </View>
                    <View style={styles.weatherHeroStatDivider} />
                    <View style={styles.weatherHeroStat}>
                      <Text style={styles.weatherHeroStatNum}>
                        {destination.weather.temperature >= 32 ? t('destination.uvStrong') : destination.weather.temperature >= 26 ? t('destination.uvMedium') : t('destination.uvWeak')}
                      </Text>
                      <Text style={styles.weatherHeroStatLabel}>{t('destination.uvIndex')}</Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Best Time to Visit */}
                <View style={styles.bestTimeCard}>
                  <View style={styles.bestTimeHeader}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                    <Text style={styles.bestTimeTitle}>{t('destination.bestSeasonTitle')}</Text>
                  </View>
                  <Text style={styles.bestTimeValue}>
                    {destination.bestSeason ?? destination.bestTimeToVisit}
                  </Text>
                  <Text style={styles.bestTimeHint}>
                    {t('destination.bestTimeHint')}
                  </Text>
                </View>

                {/* Season Overview */}
                <View style={styles.seasonCard}>
                  <Text style={styles.seasonTitle}>{t('destination.seasons.title')}</Text>
                  <View style={styles.seasonRow}>
                    {(['spring', 'summer', 'autumn', 'winter'] as const).map((sk, i) => (
                      <View key={sk} style={styles.seasonItem}>
                        <Text style={styles.seasonIcon}>{['🌸', '☀️', '🍂', '❄️'][i]}</Text>
                        <Text style={styles.seasonLabel}>{t(`destination.seasons.${sk}.label` as any)}</Text>
                        <Text style={styles.seasonMonths}>{t(`destination.seasons.${sk}.months` as any)}</Text>
                        <Text style={styles.seasonNote}>{t(`destination.seasons.${sk}.note` as any)}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Packing list */}
                <View style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <Ionicons name="bag-outline" size={16} color={Colors.primary} />
                    <Text style={styles.packTitle}>{t('destination.pack.title')}</Text>
                  </View>
                  <View style={styles.packGrid}>
                    {PACK_ICONS.map((icon, i) => (
                      <View key={i} style={styles.packItem}>
                        <Text style={styles.packEmoji}>{icon}</Text>
                        <Text style={styles.packLabel}>{t(`destination.pack.item${i + 1}` as any)}</Text>
                      </View>
                    ))}
                  </View>
                </View>

              </View>
            )}

            {/* 여행 팁 Tab */}
            {activeTab === 4 && (
              <View style={styles.section}>

                {/* Tips list */}
                {(destination.travelTipsKo ?? [
                  t('destination.tipDefault1'),
                  t('destination.tipDefault2'),
                  t('destination.tipDefault3'),
                  t('destination.tipDefault4'),
                  t('destination.tipDefault5'),
                  t('destination.tipDefault6'),
                ]).map((tip: string, i: number) => (
                  <View key={i} style={styles.tipCard}>
                    <View style={styles.tipNumBadge}>
                      <Text style={styles.tipNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}

                {/* Essential apps */}
                <Text style={styles.sectionHead}>{t('destination.apps.title')}</Text>
                <View style={styles.appsGrid}>
                  {[
                    { icon: '🚗', name: 'Grab', descKey: 'destination.apps.grab' },
                    { icon: '🗺️', name: 'Google Maps', descKey: 'destination.apps.googleMaps' },
                    { icon: '🌐', name: 'DeepL', descKey: 'destination.apps.deepl' },
                    { icon: '💱', name: 'XE Money', descKey: 'destination.apps.xeMoney' },
                  ].map(app => (
                    <View key={app.name} style={styles.appItem}>
                      <Text style={styles.appIcon}>{app.icon}</Text>
                      <Text style={styles.appName}>{app.name}</Text>
                      <Text style={styles.appDesc}>{t(app.descKey as any)}</Text>
                    </View>
                  ))}
                </View>

                {/* Emergency contacts */}
                <View style={styles.emergencyCard}>
                  <View style={styles.emergencyHeader}>
                    <Ionicons name="call-outline" size={15} color="#EF4444" />
                    <Text style={styles.emergencyTitle}>{t('destination.emergency.title')}</Text>
                  </View>
                  <View style={styles.emergencyList}>
                    {[
                      t('destination.emergency.police'),
                      t('destination.emergency.ambulance'),
                      t('destination.emergency.touristHotline'),
                    ].map((contact: string) => {
                      const [label, number] = contact.split(': ');
                      return (
                        <View key={contact} style={styles.emergencyRow}>
                          <Text style={styles.emergencyLabel}>{label}</Text>
                          <Text style={styles.emergencyNumber}>{number}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

              </View>
            )}
          </View>
        </ScrollView>

                {/* Bottom CTA */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.bottomBarInner}>
            <Button
              title={t('destination.aiItineraryCta')}
              onPress={() => router.push('/ai-planner')}
              variant="outline"
              style={{ flex: 1 }}
              icon={<Ionicons name="sparkles" size={15} color={Colors.primary} />}
              iconPosition="left"
            />
            <Button
              title={t('destination.bookHotelDest', { name: destination.nameKo })}
              onPress={() => router.push('/hotel')}
              style={{ flex: 2 }}
              icon={<Ionicons name="bed-outline" size={15} color="#FFFFFF" />}
              iconPosition="left"
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    // ── Layout ──
    container: { flex: 1, backgroundColor: Colors.background },

    // ── Hero info overlay (positioned inside HeroImage) ──
    heroInfo:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, gap: 6 },
    heroBadges:     { flexDirection: 'row', gap: Spacing.sm, marginBottom: 2 },
    heroName:       { fontSize: FontSize['2xl'], fontWeight: '800', color: '#FFFFFF', lineHeight: 34 },
    heroRegion:     { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.82)' },
    heroStats:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
    heroVisitors:   { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)' },

    // ── Common ──
    content:     { padding: Spacing.base, paddingBottom: 100 },
    section:     { gap: Spacing.md },
    sectionHead: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, marginTop: Spacing.sm },
    description: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
    emptyText:   { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
    tagList:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tagChip:     { paddingHorizontal: Spacing.md, paddingVertical: 6, backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
    tagText:     { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },

    // ── Overview: info grid ──
    infoGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    infoCard:     { width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: 6, ...Shadow.sm },
    infoIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    infoLabel:    { fontSize: FontSize.xs, color: Colors.textMuted },
    infoValue:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },

    // ── Overview: rating strip ──
    ratingStrip:      { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm, gap: Spacing.md, alignItems: 'center' },
    ratingStripLeft:  { alignItems: 'center', gap: 4 },
    ratingBig:        { fontSize: 36, fontWeight: '800', color: Colors.textPrimary, lineHeight: 40 },
    starsRow:         { flexDirection: 'row', gap: 2 },
    ratingCount:      { fontSize: FontSize.xs, color: Colors.textMuted },
    ratingStripRight: { flex: 1, gap: 8 },
    popularityLabel:  { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
    barTrack:         { height: 6, backgroundColor: Colors.surfaceSecondary, borderRadius: 3 },
    barFill:          { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
    popularityNum:    { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },

    // ── Attractions ──
    attrCard:         { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
    attrImage:        { width: '100%', height: 160, resizeMode: 'cover' } as any,
    attrBody:         { padding: Spacing.md, gap: 6 },
    attrTopRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    attrCatPill:      { backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
    attrCatText:      { fontSize: 11, fontWeight: '700', color: Colors.primary },
    koreanBadge:      { backgroundColor: '#FFF3E0', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
    koreanBadgeText:  { fontSize: 11, fontWeight: '700', color: '#D97706' },
    attrName:         { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
    attrDesc:         { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17 },
    attrRatingRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
    attrRatingNum:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    attrRatingCount:  { fontSize: FontSize.xs, color: Colors.textMuted },
    attrFooterRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
    attrDurationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
    attrDurationText: { fontSize: 11, color: Colors.textMuted },
    attrPricePill:    { backgroundColor: Colors.accent + '18', borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 3 },
    attrPriceText:    { fontSize: 11, fontWeight: '700', color: Colors.accent },
    attrFreePill:     { backgroundColor: Colors.success + '18', borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 3 },
    attrFreeText:     { fontSize: 11, fontWeight: '700', color: Colors.success },

    // ── Hotels ──
    hotelSectionHead:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    hotelSectionTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
    hotelCountBadge:   { backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
    hotelCountText:    { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
    hotelCard:         { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
    hotelImg:          { width: 100, height: 110 },
    hotelInfo:         { flex: 1, padding: Spacing.md, gap: 4, justifyContent: 'center' },
    hotelStarsRow:     { flexDirection: 'row', gap: 2 },
    hotelName:         { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
    hotelRatingRow:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
    hotelRatingBadge:  { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
    hotelRatingNum:    { fontSize: FontSize.xs, fontWeight: '800', color: '#FFFFFF' },
    hotelRatingDesc:   { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textPrimary },
    hotelReviews:      { fontSize: FontSize.xs, color: Colors.textMuted },
    hotelPriceRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    hotelPrice:        { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
    hotelPerNight:     { fontSize: FontSize.xs, color: Colors.textMuted },

    // ── Weather ──
    weatherHeroCard:        { borderRadius: Radius.xl, paddingHorizontal: Spacing.base, paddingVertical: Spacing.xl, gap: Spacing.md },
    weatherHeroTop:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    weatherDestLabel:       { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
    weatherTempHero:        { fontSize: 56, fontWeight: '800', color: '#FFFFFF', lineHeight: 60 },
    weatherCondHero:        { fontSize: FontSize.base, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
    weatherIconHero:        { fontSize: 64 },
    weatherHeroStats:       { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.lg, padding: Spacing.md },
    weatherHeroStat:        { alignItems: 'center', gap: 3 },
    weatherHeroStatNum:     { fontSize: FontSize.base, fontWeight: '800', color: '#FFFFFF' },
    weatherHeroStatLabel:   { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' },
    weatherHeroStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center' },
    bestTimeCard:    { backgroundColor: Colors.primaryLight, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.xs, borderWidth: 1, borderColor: Colors.primary + '33' },
    bestTimeHeader:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    bestTimeTitle:   { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
    bestTimeValue:   { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
    bestTimeHint:    { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
    seasonCard:      { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm, gap: Spacing.md },
    seasonTitle:     { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
    seasonRow:       { flexDirection: 'row', justifyContent: 'space-between' },
    seasonItem:      { flex: 1, alignItems: 'center', gap: 3 },
    seasonIcon:      { fontSize: 24 },
    seasonLabel:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    seasonMonths:    { fontSize: FontSize.xs, color: Colors.textMuted },
    seasonNote:      { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
    packCard:        { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm, gap: Spacing.md },
    packHeader:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    packTitle:       { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
    packGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    packItem:        { width: '30%', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.lg, padding: Spacing.sm },
    packEmoji:       { fontSize: 22 },
    packLabel:       { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },

    // ── Tips ──
    tipCard:      { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, ...Shadow.sm },
    tipNumBadge:  { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    tipNumText:   { fontSize: FontSize.sm, fontWeight: '800', color: '#FFFFFF' },
    tipText:      { flex: 1, fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
    appsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    appItem:      { width: '22%', alignItems: 'center', gap: 4, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.md, ...Shadow.sm },
    appIcon:      { fontSize: 26 },
    appName:      { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
    appDesc:      { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
    emergencyCard:   { backgroundColor: '#FEF2F2', borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.md, borderWidth: 1, borderColor: '#FCA5A5' },
    emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    emergencyTitle:  { fontSize: FontSize.base, fontWeight: '700', color: '#EF4444' },
    emergencyList:   { gap: Spacing.sm },
    emergencyRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    emergencyLabel:  { fontSize: FontSize.sm, color: '#7F1D1D', fontWeight: '600' },
    emergencyNumber: { fontSize: FontSize.sm, fontWeight: '800', color: '#EF4444' },

    // ── Bottom CTA ──
    bottomBar:      { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
    bottomBarInner: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.sm },
  });
}
