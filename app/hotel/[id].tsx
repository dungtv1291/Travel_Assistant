import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { hotelsService } from '../../services/mock/hotels.service';
import { Hotel, RoomType } from '../../types/hotel.types';
import { LoadingState } from '../../components/common/LoadingState';
import { HOTEL_CATEGORY, ratingLabel } from '../../constants/categoryMeta';
import { HeroImage, HeroButton, DetailTabBar, StickyBottomBar } from '../../components/ui';
import RoomCard from '../../components/hotels/RoomCard';

const HERO_HEIGHT = 320;

const AMENITY_ICONS: Record<string, string> = {
  '수영장':          'water-outline',
  '스파':           'flower-outline',
  '레스토랑':        'restaurant-outline',
  '피트니스':        'fitness-outline',
  '비치 뷰':         'sunny-outline',
  '발코니':          'home-outline',
  '조식':           'cafe-outline',
  '무료 WiFi':       'wifi-outline',
  '무료 와이파이':    'wifi-outline',
  '주차':           'car-outline',
  '컨시어지':        'person-outline',
  '프라이빗 비치':   'umbrella-outline',
  '워터파크':        'happy-outline',
  '키즈 클럽':       'people-outline',
  '클럽 라운지':     'wine-outline',
  '루프탑 수영장':   'water-outline',
  '바':            'wine-outline',
  '올인클루시브 스파': 'flower-outline',
  '강변 테라스':     'leaf-outline',
  '쿠킹 클래스':     'restaurant-outline',
  '자전거 렌탈':     'bicycle-outline',
  '요트 투어':       'boat-outline',
  '골프장':         'golf-outline',
};

const AVATAR_COLORS = [
  '#1BBCD4', '#FF6B35', '#8B5CF6', '#10B981',
  '#F59E0B', '#EF4444', '#3B82F6', '#D97706',
];

const TABS = ['객실 선택', '시설/어메니티', '숙박 정책', '후기'];

export default function HotelDetailScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
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

  if (loading) return <LoadingState message="불러오는 중..." />;
  if (!hotel)  return <LoadingState message="호텔 정보를 찾을 수 없습니다." />;

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  const ratingDesc = ratingLabel(hotel.rating);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Hero ── */}
          <HeroImage
            imageUrl={hotel.imageUrl}
            height={HERO_HEIGHT}
            onBack={() => router.back()}
            rightActions={
              <>
                <HeroButton>
                  <Ionicons name="heart-outline" size={20} color="#FFF" />
                </HeroButton>
                <HeroButton>
                  <Ionicons name="share-outline" size={20} color="#FFF" />
                </HeroButton>
              </>
            }
          >
            <View style={styles.heroInfo}>
              {/* Badges row */}
              <View style={styles.heroBadgesRow}>
                <View style={styles.heroCatBadge}>
                  <Text style={styles.heroCatText}>{HOTEL_CATEGORY[hotel.category]?.label ?? hotel.category}</Text>
                </View>
                {hotel.isRecommended && (
                  <View style={styles.heroRecBadge}>
                    <Ionicons name="sparkles" size={10} color={Colors.primary} />
                    <Text style={styles.heroRecText}>편집자 추천</Text>
                  </View>
                )}
              </View>
              {/* Star rating */}
              <View style={styles.heroStars}>
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={13} color="#FFC107" />
                ))}
              </View>
              {/* Name */}
              <Text style={styles.heroName}>{hotel.nameKo}</Text>
              {/* Location */}
              <View style={styles.heroLocationRow}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroLocation}>{hotel.location}</Text>
              </View>
              {/* Rating row */}
              <View style={styles.heroRatingRow}>
                <View style={styles.heroRatingBadge}>
                  <Text style={styles.heroRatingNum}>{hotel.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.heroRatingDesc}>{ratingDesc}</Text>
                <Text style={styles.heroReviewCount}>후기 {hotel.reviewCount.toLocaleString()}개</Text>
              </View>
            </View>
          </HeroImage>

          {/* ── Tabs ── */}
          <DetailTabBar tabs={TABS} activeIndex={activeTab} onChange={setActiveTab} />

          <View style={styles.content}>

            {/* ── 객실 선택 Tab ── */}
            {activeTab === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>객실을 선택하세요</Text>
                {rooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selected={selectedRoom === room.id}
                    onSelect={r => setSelectedRoom(r.id)}
                  />
                ))}
              </View>
            )}

            {/* ── 시설/어메니티 Tab ── */}
            {activeTab === 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>주요 시설</Text>
                <View style={styles.amenityGrid}>
                  {hotel.amenities.map(am => (
                    <View key={am} style={styles.amenityItem}>
                      <View style={styles.amenityIconWrap}>
                        <Ionicons
                          name={(AMENITY_ICONS[am] ?? 'checkmark-circle-outline') as any}
                          size={20}
                          color={Colors.primary}
                        />
                      </View>
                      <Text style={styles.amenityText}>{am}</Text>
                    </View>
                  ))}
                </View>
                {hotel.descriptionKo && (
                  <>
                    <Text style={styles.sectionTitle}>호텔 소개</Text>
                    <View style={styles.descCard}>
                      <Text style={styles.descText}>{hotel.descriptionKo}</Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* ── 숙박 정책 Tab ── */}
            {activeTab === 2 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>숙박 정책</Text>
                <View style={styles.policyCard}>
                  {[
                    { icon: 'enter-outline',         label: '체크인',   value: hotel.policies?.checkIn ?? '14:00' },
                    { icon: 'exit-outline',          label: '체크아웃', value: hotel.policies?.checkOut ?? '12:00' },
                    { icon: 'close-circle-outline',  label: '취소 정책', value: hotel.policies?.cancellation ?? '체크인 24시간 전 무료 취소', accent: true },
                    { icon: 'paw-outline',           label: '반려동물', value: hotel.policies?.pets === false ? '반려동물 불가' : '반려동물 가능' },
                    { icon: 'ban-outline',           label: '흡연',     value: hotel.policies?.smoking === false ? '전 구역 금연' : '흡연 구역 별도' },
                  ].map((p, idx, arr) => (
                    <View
                      key={p.label}
                      style={[styles.policyRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}
                    >
                      <View style={styles.policyLeft}>
                        <View style={styles.policyIconWrap}>
                          <Ionicons name={p.icon as any} size={16} color={Colors.primary} />
                        </View>
                        <Text style={styles.policyLabel}>{p.label}</Text>
                      </View>
                      <Text style={[styles.policyValue, p.accent && { color: Colors.success }]}>
                        {p.value}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.policyNoticeCard}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
                  <Text style={styles.policyNoticeText}>
                    예약 전 최신 정책을 반드시 확인하세요. 성수기에는 취소 정책이 달라질 수 있습니다.
                  </Text>
                </View>
              </View>
            )}

            {/* ── 후기 Tab ── */}
            {activeTab === 3 && (
              <View style={styles.section}>
                {/* Score hero */}
                <View style={styles.reviewHero}>
                  <View style={styles.reviewHeroLeft}>
                    <Text style={styles.reviewBigScore}>{hotel.rating.toFixed(1)}</Text>
                    <Text style={styles.reviewDesc}>{ratingDesc}</Text>
                    <View style={styles.reviewStarsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={14}
                          color={i < Math.round(hotel.rating) ? '#F59E0B' : '#E5E7EB'}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.reviewHeroRight}>
                    <Text style={styles.reviewTotalCount}>후기 {hotel.reviewCount.toLocaleString()}개</Text>
                    <Text style={styles.reviewHeroSub}>실제 투숙객 후기</Text>
                  </View>
                </View>

                {/* Review cards */}
                {(hotel.reviews ?? []).map((rev: any, i: number) => (
                  <View key={i} style={styles.reviewCard}>
                    <View style={styles.revHeader}>
                      <View style={[styles.revAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                        <Text style={styles.revAvatarText}>{rev.userName[0]}</Text>
                      </View>
                      <View style={styles.revMeta}>
                        <Text style={styles.revAuthor}>{rev.userName}</Text>
                        <View style={styles.revStarsRow}>
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Ionicons
                              key={si}
                              name="star"
                              size={11}
                              color={si < Math.round(rev.rating) ? '#F59E0B' : '#E5E7EB'}
                            />
                          ))}
                          <Text style={styles.revRatingNum}>{rev.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                      <Text style={styles.revDate}>{rev.date.replace(/-/g, '.')}</Text>
                    </View>
                    <Text style={styles.revText}>{rev.comment}</Text>
                  </View>
                ))}
                {(!hotel.reviews || hotel.reviews.length === 0) && (
                  <Text style={styles.noReviewText}>아직 후기가 없습니다.</Text>
                )}
              </View>
            )}

          </View>
        </ScrollView>

        {/* ── Sticky booking bar ── */}
        <StickyBottomBar
          label={selectedRoomData?.nameKo ?? hotel.nameKo}
          price={selectedRoomData?.pricePerNight ?? hotel.pricePerNight}
          priceUnit="/박"
          buttonTitle="지금 예약하기"
          buttonIcon={{ name: 'calendar-outline' }}
          onPress={() => router.push({ pathname: '/hotel/booking', params: {
            hotelId: hotel.id,
            roomId: selectedRoom ?? '',
            hotelName: hotel.nameKo,
            roomName: selectedRoomData?.nameKo ?? '',
            hotelImage: hotel.imageUrl,
            roomPrice: String(selectedRoomData?.pricePerNight ?? hotel.pricePerNight),
          } } as never)}
        />

      </View>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container:       { flex: 1, backgroundColor: Colors.background },

    // ── Hero overlay (anchored to HeroImage bottom) ──
    heroInfo:        { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, gap: 6 },
    heroBadgesRow:   { flexDirection: 'row', gap: Spacing.sm, marginBottom: 2 },
    heroCatBadge:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
    heroCatText:     { fontSize: FontSize.xs, fontWeight: '700', color: '#FFFFFF' },
    heroRecBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 4 },
    heroRecText:     { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
    heroStars:       { flexDirection: 'row', gap: 2 },
    heroName:        { fontSize: FontSize['2xl'], fontWeight: '800', color: '#FFF', lineHeight: 34 },
    heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heroLocation:    { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
    heroRatingRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    heroRatingBadge: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
    heroRatingNum:   { fontSize: FontSize.sm, fontWeight: '800', color: '#FFFFFF' },
    heroRatingDesc:  { fontSize: FontSize.sm, fontWeight: '700', color: 'rgba(255,255,255,0.95)' },
    heroReviewCount: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' },

    // ── Content ──
    content:      { padding: Spacing.base, paddingBottom: 120 },
    section:      { gap: Spacing.md },
    sectionTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.xs },

    // ── Amenities ──
    amenityGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    amenityItem:     { width: '30%', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
    amenityIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    amenityText:     { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
    descCard:        { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
    descText:        { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },

    // ── Policy ──
    policyCard:        { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
    policyRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
    policyLeft:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    policyIconWrap:    { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    policyLabel:       { fontSize: FontSize.base, color: Colors.textSecondary },
    policyValue:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
    policyNoticeCard:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '33' },
    policyNoticeText:  { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, flex: 1 },

    // ── Reviews ──
    reviewHero:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm, gap: Spacing.lg },
    reviewHeroLeft:   { alignItems: 'center', gap: 4 },
    reviewBigScore:   { fontSize: 52, fontWeight: '800', color: Colors.primary, lineHeight: 56 },
    reviewDesc:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    reviewStarsRow:   { flexDirection: 'row', gap: 2 },
    reviewHeroRight:  { flex: 1, gap: 4 },
    reviewTotalCount: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
    reviewHeroSub:    { fontSize: FontSize.xs, color: Colors.textMuted },
    reviewCard:       { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
    revHeader:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    revAvatar:        { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    revAvatarText:    { fontSize: FontSize.base, fontWeight: '800', color: '#FFF' },
    revMeta:          { flex: 1, gap: 3 },
    revAuthor:        { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    revStarsRow:      { flexDirection: 'row', alignItems: 'center', gap: 2 },
    revRatingNum:     { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, marginLeft: 3 },
    revDate:          { fontSize: FontSize.xs, color: Colors.textMuted },
    revText:          { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
    noReviewText:     { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xl },
  });
}
