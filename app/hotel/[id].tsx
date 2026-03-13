import React, { useEffect, useState , useMemo} from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { hotelsService } from '../../services/mock/hotels.service';
import { Hotel, RoomType } from '../../types/hotel.types';
import { Rating } from '../../components/common/Rating';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { formatKRWPrice } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function HotelDetailScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([hotelsService.getById(id), hotelsService.getRooms(id)]).then(([h, r]) => {
        setHotel(h || null);
        setRooms(r);
        if (r.length > 0) setSelectedRoom(r[0].id);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <LoadingState message={t('common.loading')} />;
  if (!hotel) return <LoadingState message={t('destination.notFound')} />;

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <Image source={{ uri: hotel.imageUrl }} style={styles.heroImage} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={styles.heroGrad} />
            <SafeAreaView edges={['top']} style={styles.heroSafe}>
              <View style={styles.heroActs}>
                <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.heroBtn}>
                  <Ionicons name="share-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
            <View style={styles.heroInfo}>
              <View style={styles.heroStars}>
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color="#FFC107" />
                ))}
              </View>
              <Text style={styles.heroName}>{hotel.nameKo}</Text>
              <Text style={styles.heroLocation}>📍 {hotel.location}</Text>
              <View style={styles.heroRow}>
                <Rating value={hotel.rating} reviewCount={hotel.reviewCount} size="sm" />
                {hotel.isRecommended && <Badge label={t('common.recommend')} variant="primary" size="sm" />}
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {[t('hotels.roomInfo'), t('hotels.amenities'), t('hotels.policy'), t('hotels.reviews')].map((tab, i) => (
              <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)}>
                <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.content}>
            {/* 객실 정보 */}
            {activeTab === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('hotels.selectRoom')}</Text>
                {rooms.map(room => (
                  <TouchableOpacity
                    key={room.id}
                    style={[styles.roomCard, selectedRoom === room.id && styles.roomCardSelected]}
                    onPress={() => setSelectedRoom(room.id)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: room.imageUrl }} style={styles.roomImage} />
                    <View style={styles.roomContent}>
                      <View style={styles.roomHeader}>
                        <Text style={styles.roomName}>{room.nameKo}</Text>
                        {selectedRoom === room.id && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </View>
                      <Text style={styles.roomSize}>{t('hotels.maxOccupancy', { count: room.maxOccupancy ?? 0 })} · {t('hotels.size', { size: room.size ?? 0 })}</Text>
                      <View style={styles.roomFeatures}>
                        {(room.features ?? []).slice(0, 3).map(f => (
                          <View key={f} style={styles.roomFeature}>
                            <Ionicons name="checkmark" size={11} color={Colors.success} />
                            <Text style={styles.roomFeatureText}>{f}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.roomFooter}>
                        <View>
                          <Text style={styles.roomPriceLabel}>{t('hotels.perNight')}</Text>
                          <Text style={styles.roomPrice}>{formatKRWPrice(room.pricePerNight)}</Text>
                        </View>
                        {room.breakfastIncluded && (
                          <Badge label={t('hotels.breakfastIncluded')} variant="success" size="sm" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 어메니티 */}
            {activeTab === 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('hotels.amenities')}</Text>
                <View style={styles.amenityGrid}>
                  {hotel.amenities.map(am => {
                    const icons: Record<string, string> = {
                      '수영장': 'water-outline', '스파': 'flower-outline', '레스토랑': 'restaurant-outline',
                      '피트니스': 'fitness-outline', '비치 뷰': 'sunny-outline', '발코니': 'home-outline',
                      '조식': 'cafe-outline', '무료 와이파이': 'wifi-outline',
                    };
                    return (
                      <View key={am} style={styles.amenityItem}>
                        <Ionicons name={(icons[am] ?? 'checkmark-circle-outline') as any} size={22} color={Colors.primary} />
                        <Text style={styles.amenityText}>{am}</Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.sectionTitle}>설명</Text>
                <Text style={styles.descText}>{hotel.descriptionKo}</Text>
              </View>
            )}

            {/* 정책 */}
            {activeTab === 2 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('hotels.checkInOut')}</Text>
                {[
                  { label: t('hotels.checkIn'), value: hotel.policies?.checkIn ?? '14:00' },
                  { label: t('hotels.checkOut'), value: hotel.policies?.checkOut ?? '12:00' },
                  { label: t('hotels.cancelPolicy'), value: hotel.policies?.cancellation ?? t('hotels.freeCancelBefore24') },
                  { label: t('hotels.pets'), value: hotel.policies?.petsAllowed ? t('hotels.allowed') : t('hotels.notAllowed') },
                  { label: t('hotels.smoking'), value: hotel.policies?.smokingAllowed ? t('hotels.smokingAllowed') : t('hotels.noSmoking') },
                ].map(p => (
                  <View key={p.label} style={styles.policyRow}>
                    <Text style={styles.policyLabel}>{p.label}</Text>
                    <Text style={styles.policyValue}>{p.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 리뷰 */}
            {activeTab === 3 && (
              <View style={styles.section}>
                <View style={styles.reviewSummary}>
                  <Text style={styles.reviewScore}>{hotel.rating}</Text>
                  <View>
                    <Rating value={hotel.rating} size="md" />
                    <Text style={styles.reviewCount}>{t('hotels.reviewCount', { count: hotel.reviewCount.toLocaleString() })}</Text>
                  </View>
                </View>
                {(hotel.reviews ?? []).map((rev: any, i: number) => (
                  <View key={i} style={styles.reviewCard}>
                    <View style={styles.revHeader}>
                      <View style={styles.revAvatar}><Text style={styles.revAvatarText}>{rev.userName[0]}</Text></View>
                      <View>
                        <Text style={styles.revAuthor}>{rev.userName}</Text>
                        <Rating value={rev.rating} size="sm" />
                      </View>
                      <Text style={styles.revDate}>{rev.date}</Text>
                    </View>
                    <Text style={styles.revText}>{rev.comment}</Text>
                  </View>
                ))}
                {(!hotel.reviews || hotel.reviews.length === 0) && (
                  <Text style={styles.noReviewText}>아직 리뷰가 없습니다.</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.bottomInner}>
            <View>
              <Text style={styles.bottomPriceLabel}>{t('hotels.perNight')}</Text>
              <Text style={styles.bottomPrice}>
                {selectedRoomData ? formatKRWPrice(selectedRoomData.pricePerNight) : formatKRWPrice(hotel.pricePerNight)}
              </Text>
            </View>
            <Button
              title={t('hotels.book')}
              onPress={() => router.push({ pathname: '/hotel/booking', params: {
                hotelId: hotel.id,
                roomId: selectedRoom ?? '',
                hotelName: hotel.nameKo,
                roomName: selectedRoomData?.nameKo ?? '',
                hotelImage: hotel.imageUrl,
                roomPrice: String(selectedRoomData?.pricePerNight ?? hotel.pricePerNight),
              } } as never)}
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
  hero: { height: 300, position: 'relative' },
  heroImage: { width, height: 300, resizeMode: 'cover' },
  heroGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 },
  heroSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  heroActs: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  heroBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, gap: Spacing.xs },
  heroStars: { flexDirection: 'row', gap: 2 },
  heroName: { fontSize: FontSize['2xl'], fontWeight: '800', color: '#FFF' },
  heroLocation: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  heroRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  tabsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  content: { padding: Spacing.base },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  roomCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', ...Shadow.sm },
  roomCardSelected: { borderColor: Colors.primary },
  roomImage: { width: '100%', height: 140, resizeMode: 'cover' },
  roomContent: { padding: Spacing.md, gap: Spacing.sm },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  roomSize: { fontSize: FontSize.sm, color: Colors.textMuted },
  roomFeatures: { gap: 4 },
  roomFeature: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roomFeatureText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  roomFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  roomPriceLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  roomPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  amenityItem: { width: '28%', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  amenityText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  descText: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  policyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  policyLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  policyValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.sm },
  reviewScore: { fontSize: 48, fontWeight: '800', color: Colors.primary },
  reviewCount: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  revHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  revAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  revAvatarText: { fontSize: FontSize.base, fontWeight: '700', color: '#FFF' },
  revAuthor: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  revDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: 'auto' },
  revText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  noReviewText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xl },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  bottomInner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', paddingBottom: Spacing.sm },
  bottomPriceLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  bottomPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  });
}
