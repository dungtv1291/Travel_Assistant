import React, { useEffect, useState , useMemo} from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { aiPlannerService } from '../../services/mock/ai-planner.service';
import { useTripsStore } from '../../store/trips.store';
import { Trip, DayItinerary } from '../../types/trip.types';
import { TimelineItem } from '../../components/trips/TimelineItem';
import { LoadingState } from '../../components/common/LoadingState';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguageStore } from '../../store/language.store';
import { formatKRWPrice, formatVNDPrice } from '../../utils/format';

export default function AIPlannerResultsScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { locale } = useLanguageStore();
  const { destination, days, travelStyle, travelerType, budget, pace, interests } = useLocalSearchParams<Record<string, string>>();
  const { saveTrip } = useTripsStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const defaultDest = locale === 'ko' ? '다낭' : 'Da Nang';

  useEffect(() => {
    aiPlannerService.generateItinerary({
      destination: destination ?? defaultDest,
      duration: parseInt(days ?? '5', 10),
      travelStyle: (travelStyle ?? 'cultural') as any,
      travelers: (travelerType ?? 'couple') as any,
      budget: budget === 'luxury' ? 3000000 : budget === 'budget' ? 500000 : 1500000,
      interests: interests ? interests.split(',').filter(Boolean) : [],
      pace: (pace as any) ?? 'moderate',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + parseInt(days ?? '5', 10) * 86400000).toISOString().split('T')[0],
    }).then(t => {
      setTrip(t);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!trip || saved) return;
    setSaving(true);
    await saveTrip(trip);
    setSaving(false);
    setSaved(true);
    Alert.alert(t('aiPlanner.savedSuccess'), t('aiPlanner.savedSuccessHint'));
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setSelectedDay(0);
    const newTrip = await aiPlannerService.generateItinerary({
      destination: destination ?? defaultDest,
      duration: parseInt(days ?? '5', 10),
      travelStyle: (travelStyle ?? 'cultural') as any,
      travelers: (travelerType ?? 'couple') as any,
      budget: budget === 'luxury' ? 3000000 : budget === 'budget' ? 500000 : 1500000,
      interests: interests ? interests.split(',').filter(Boolean) : [],
      pace: (pace as any) ?? 'moderate',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + parseInt(days ?? '5', 10) * 86400000).toISOString().split('T')[0],
    });
    setTrip(newTrip);
    setSaved(false);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[Colors.primary, '#6B35FF']} style={styles.loadingGrad}>
          <Ionicons name="sparkles" size={48} color="#FFFFFF" />
          <Text style={styles.loadingTitle}>{t('aiPlanner.generating')}</Text>
          <Text style={styles.loadingSub}>{t('aiPlanner.generatingSubtitle', { destination: destination ?? '', days: days ?? '' })}</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!trip) return <LoadingState message={t('aiPlanner.generateFailed')} />;

  const dayItinerary: DayItinerary = trip.itinerary[selectedDay];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{trip.title}</Text>
            <Text style={styles.headerSub}>{t('aiPlanner.nightsDays', { days: trip.duration, nextDays: trip.duration + 1 })}</Text>
          </View>
          <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnSaved]} onPress={handleSave}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Trip Summary Card */}
        <LinearGradient
          colors={['#1BBCD4', '#6B35FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          {/* Destination + AI badge row */}
          <View style={styles.summaryTop}>
            <View style={styles.destPill}>
              <Ionicons name="location" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.destText}>{trip.destination}</Text>
            </View>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>AI 생성</Text>
            </View>
          </View>
          {/* Stats row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNum}>{trip.duration}박 {trip.duration + 1}일</Text>
              <Text style={styles.summaryStatLabel}>여행 기간</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNum}>{trip.itinerary.reduce((acc, d) => acc + d.activities.length, 0)}</Text>
              <Text style={styles.summaryStatLabel}>전체 활동</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNum}>{formatKRWPrice(trip.totalEstimatedCost)}</Text>
              <Text style={styles.summaryStatLabel}>예상 원화 경비</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Day Tabs */}
        <View style={styles.dayTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabsContent}
          >
            {trip.itinerary.map((day, i) => {
              const parts = day.date.split('-');
              const shortDate = `${parseInt(parts[1], 10)}.${parts[2]}`;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayTab, selectedDay === i && styles.dayTabActive]}
                  onPress={() => setSelectedDay(i)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayTabNum, selectedDay === i && styles.dayTabNumActive]}>
                    DAY {i + 1}
                  </Text>
                  <Text style={[styles.dayTabSub, selectedDay === i && styles.dayTabSubActive]}>
                    {shortDate} · {day.activities.length}개
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Day Content */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.dayContent}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <View style={styles.dayTitleRow}>
                <View style={styles.dayNumBadge}>
                  <Text style={styles.dayNumText}>DAY {selectedDay + 1}</Text>
                </View>
                <View style={styles.dayTitleGroup}>
                  <Text style={styles.dayTheme}>
                    {dayItinerary.title || `${trip.destination} 탐방`}
                  </Text>
                  <View style={styles.dayMetaRow}>
                    {dayItinerary.weatherNote ? (
                      <View style={styles.weatherPill}>
                        <Ionicons name="partly-sunny-outline" size={11} color={Colors.textMuted} />
                        <Text style={styles.weatherText}>{dayItinerary.weatherNote}</Text>
                      </View>
                    ) : null}
                    {dayItinerary.estimatedCost > 0 ? (
                      <View style={styles.dayCostPill}>
                        <Ionicons name="wallet-outline" size={11} color={Colors.primary} />
                        <Text style={styles.dayCostText}>{formatVNDPrice(dayItinerary.estimatedCost)}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>

            {/* Timeline */}
            {dayItinerary.activities.map((activity, i) => (
              <TimelineItem
                key={activity.id}
                activity={activity}
                isLast={i === dayItinerary.activities.length - 1}
              />
            ))}

            {/* Booking reminders */}
            {dayItinerary.activities.filter(a => a.bookingRequired).length > 0 && (
              <View style={styles.warningCard}>
                <View style={styles.warningHeaderRow}>
                  <View style={styles.warningIconWrap}>
                    <Ionicons name="alert-circle" size={14} color="#D97706" />
                  </View>
                  <Text style={styles.warningTitle}>사전 예약 필요</Text>
                  <View style={styles.warningCountBadge}>
                    <Text style={styles.warningCountText}>
                      {dayItinerary.activities.filter(a => a.bookingRequired).length}건
                    </Text>
                  </View>
                </View>
                <View style={styles.warningList}>
                  {dayItinerary.activities.filter(a => a.bookingRequired).map(a => (
                    <View key={a.id} style={styles.warningRow}>
                      <View style={styles.warningDot} />
                      <Text style={styles.warningItem}>{a.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* AI Smart Tips */}
            {selectedDay === 0 && trip.aiInsights && trip.aiInsights.length > 0 && (
              <View style={styles.insightsCard}>
                <View style={styles.insightsHeader}>
                  <Ionicons name="sparkles" size={14} color={Colors.primary} />
                  <Text style={styles.insightsTitle}>AI 스마트 팁</Text>
                </View>
                <View style={styles.insightsList}>
                  {trip.aiInsights.map((tip, i) => (
                    <View key={i} style={styles.insightRow}>
                      <View style={styles.insightNum}>
                        <Text style={styles.insightNumText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.insightText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.bottomInner}>
            <Button
              title={t('aiPlanner.regenerate')}
              variant="outline"
              onPress={handleRegenerate}
              style={{ flex: 1 }}
            />
            <Button
              title={saved ? t('aiPlanner.saved') : t('aiPlanner.saveTrip')}
              onPress={handleSave}
              loading={saving}
              style={{ flex: 1 }}
              variant={saved ? 'secondary' : 'primary'}
            />
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    // ── Loading ──
    loadingContainer: { flex: 1 },
    loadingGrad:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
    loadingTitle:     { fontSize: FontSize.xl, fontWeight: '800', color: '#FFF', textAlign: 'center' },
    loadingSub:       { fontSize: FontSize.base, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

    // ── Layout ──
    safe:          { flex: 1, backgroundColor: Colors.background },
    header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
    backBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
    headerCenter:  { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.sm },
    headerTitle:   { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
    headerSub:     { fontSize: FontSize.xs, color: Colors.textMuted },
    saveBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
    saveBtnSaved:  { backgroundColor: Colors.primaryLight },
    scroll:        { flex: 1 },
    dayContent:    { paddingHorizontal: Spacing.base, paddingBottom: 120 },

    // ── Summary card ──
    summaryCard:      { marginHorizontal: Spacing.base, borderRadius: Radius.xl, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
    summaryTop:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    destPill:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
    destText:         { fontSize: FontSize.sm, fontWeight: '600', color: '#FFFFFF' },
    aiBadge:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 5 },
    aiBadgeText:      { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
    summaryRow:       { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    summaryStat:      { alignItems: 'center', gap: 3, flex: 1 },
    summaryStatNum:   { fontSize: FontSize.lg, fontWeight: '800', color: '#FFF', lineHeight: 24 },
    summaryStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.72)', textAlign: 'center' },
    summaryDivider:   { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },

    // ── Day tabs ──
    dayTabsWrapper: { height: 62, justifyContent: 'center', marginBottom: Spacing.sm },
    dayTabsContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center' },
    dayTab:         { minWidth: 72, alignItems: 'center', paddingVertical: 8, paddingHorizontal: Spacing.md, borderRadius: Radius.xl, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
    dayTabActive:   { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
    dayTabNum:      { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 0.5 },
    dayTabNumActive:{ color: Colors.primary },
    dayTabSub:      { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
    dayTabSubActive:{ color: Colors.primary },

    // ── Day header ──
    dayHeader:     { marginTop: Spacing.md, marginBottom: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
    dayTitleRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    dayNumBadge:   { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 5, alignSelf: 'flex-start' },
    dayNumText:    { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
    dayTitleGroup: { flex: 1, gap: 6 },
    dayTheme:      { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
    dayMetaRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    weatherPill:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
    weatherText:   { fontSize: FontSize.xs, color: Colors.textMuted },
    dayCostPill:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
    dayCostText:   { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

    // ── Booking warning ──
    warningCard:       { backgroundColor: '#FFFBEB', borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: '#FDE68A', gap: Spacing.sm },
    warningHeaderRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    warningIconWrap:   { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FDE68A', alignItems: 'center', justifyContent: 'center' },
    warningTitle:      { flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: '#92400E' },
    warningCountBadge: { backgroundColor: '#FDE68A', borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2 },
    warningCountText:  { fontSize: 10, color: '#B45309', fontWeight: '700' },
    warningList:       { gap: 4 },
    warningRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    warningDot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D97706' },
    warningItem:       { flex: 1, fontSize: FontSize.sm, color: '#92400E', lineHeight: 18 },

    // ── AI Smart Tips ──
    insightsCard:   { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '30' },
    insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
    insightsTitle:  { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
    insightsList:   { padding: Spacing.md, gap: Spacing.sm },
    insightRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
    insightNum:     { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    insightNumText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
    insightText:    { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 19 },

    // ── Bottom bar ──
    bottomBar:   { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
    bottomInner: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.sm },
  });
}
