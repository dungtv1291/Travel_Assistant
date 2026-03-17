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
        <LinearGradient colors={[Colors.primary, '#6B35FF']} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNum}>{t('aiPlanner.nightsDays', { days: trip.duration, nextDays: trip.duration + 1 })}</Text>
              <Text style={styles.summaryStatLabel}>{t('aiPlanner.travelPeriod')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNum}>{trip.itinerary.reduce((acc, d) => acc + d.activities.length, 0)}</Text>
              <Text style={styles.summaryStatLabel}>{t('trips.activities')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatNum}>{formatKRWPrice(trip.totalEstimatedCost)}</Text>
              <Text style={styles.summaryStatLabel}>{t('aiPlanner.estimatedCost')}</Text>
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
            {trip.itinerary.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayTab, selectedDay === i && styles.dayTabActive]}
                onPress={() => setSelectedDay(i)}
              >
                <Text style={[styles.dayTabLabel, selectedDay === i && styles.dayTabLabelActive]}>{t('aiPlanner.day', { number: i + 1 })}</Text>
                <Text style={[styles.dayTabDate, selectedDay === i && styles.dayTabDateActive]}>
                  {t('aiPlanner.activities', { count: day.activities.length })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Day Content */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.dayContent}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{t('aiPlanner.day', { number: selectedDay + 1 })} — {dayItinerary.date}</Text>
              {dayItinerary.title && (
                <Text style={styles.dayTheme}>{dayItinerary.title}</Text>
              )}
              {dayItinerary.weatherNote && (
                <View style={styles.weatherRow}>
                  <Ionicons name="partly-sunny-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.weatherText}>{dayItinerary.weatherNote}</Text>
                </View>
              )}
            </View>

            {/* Timeline */}
            {dayItinerary.activities.map((activity, i) => (
              <TimelineItem
                key={activity.id}
                activity={activity}
                isLast={i === dayItinerary.activities.length - 1}
              />
            ))}

            {/* Day Budget Breakdown */}
            {dayItinerary.estimatedCost > 0 && (
              <View style={styles.dayCostCard}>
                <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
                <Text style={styles.dayCostLabel}>{t('aiPlanner.estimatedCost')}</Text>
                <Text style={styles.dayCostValue}>
                  {formatVNDPrice(dayItinerary.estimatedCost)}
                </Text>
              </View>
            )}

            {/* Booking reminders */}
            {dayItinerary.activities.filter(a => a.bookingRequired).length > 0 && (
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="alert-circle-outline" size={15} color="#E67E22" />
                  <Text style={styles.warningTitle}>{t('aiPlanner.bookingReminder')}</Text>
                </View>
                {dayItinerary.activities.filter(a => a.bookingRequired).map(a => (
                  <Text key={a.id} style={styles.warningItem}>• {a.title} — {t('aiPlanner.bookingRequired')}</Text>
                ))}
              </View>
            )}

            {/* AI Insights (shown once, at bottom) */}
            {selectedDay === 0 && trip.aiInsights && trip.aiInsights.length > 0 && (
              <View style={styles.insightsCard}>
                <View style={styles.insightsHeader}>
                  <Ionicons name="sparkles" size={16} color={Colors.primary} />
                  <Text style={styles.insightsTitle}>{t('aiPlanner.aiInsightsTitle')}</Text>
                </View>
                {trip.aiInsights.map((tip, i) => (
                  <View key={i} style={styles.insightRow}>
                    <Text style={styles.insightBullet}>•</Text>
                    <Text style={styles.insightText}>{tip}</Text>
                  </View>
                ))}
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
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1 },
  loadingGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  loadingTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  loadingSub: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  saveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  saveBtnSaved: { backgroundColor: Colors.primaryLight },
  summaryCard: { marginHorizontal: Spacing.base, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryStat: { alignItems: 'center', gap: 2 },
  summaryStatNum: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFF' },
  summaryStatLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  dayTabsWrapper: { height: 54, justifyContent: 'center', marginBottom: Spacing.sm },
  dayTabs: { marginBottom: Spacing.sm, height: 54 },
  dayTabsContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center' },
  dayTab: { minWidth: 56, alignItems: 'center', paddingVertical: 6, paddingHorizontal: Spacing.sm, borderRadius: Radius.xl, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  dayTabActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayTabLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase' },
  dayTabLabelActive: { color: Colors.primary },
  dayTabDate: { fontSize: 9, color: Colors.textMuted, lineHeight: 12 },
  dayTabDateActive: { color: Colors.primary },
  scroll: { flex: 1 },
  dayContent: { padding: Spacing.base, paddingBottom: 120 },
  dayHeader: { marginBottom: Spacing.xl, gap: Spacing.xs, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dayTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  dayTheme: { fontSize: FontSize.base, color: Colors.textMuted, fontStyle: 'italic' },
  dayCostCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.md },
  dayCostLabel: { flex: 1, fontSize: FontSize.base, color: Colors.primary, fontWeight: '600' },
  dayCostValue: { fontSize: FontSize.base, fontWeight: '800', color: Colors.primary },
  insightsCard: { marginBottom: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.sm, gap: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  insightsTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  insightRow: { flexDirection: 'row', gap: Spacing.xs },
  insightBullet: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 18 },
  insightText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 },
  weatherText: { fontSize: FontSize.sm, color: Colors.textMuted },
  warningCard: { backgroundColor: '#FEF3E2', borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.sm, gap: Spacing.xs, borderWidth: 1, borderColor: '#FAD7A0' },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  warningTitle: { fontSize: FontSize.sm, fontWeight: '700', color: '#E67E22' },
  warningItem: { fontSize: FontSize.sm, color: '#8B6914', lineHeight: 18 },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  bottomInner: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.sm },
  });
}
