import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/colors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { aiPlannerService } from '../../services/mock/ai-planner.service';
import { useTripsStore } from '../../store/trips.store';
import { Trip, DayItinerary } from '../../types/trip.types';
import { TimelineItem } from '../../components/trips/TimelineItem';
import { LoadingState } from '../../components/common/LoadingState';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';

export default function AIPlannerResultsScreen() {
  const { t } = useTranslation();
  const { destination, days, travelStyle, travelerType, budget } = useLocalSearchParams<Record<string, string>>();
  const { saveTrip } = useTripsStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    aiPlannerService.generateItinerary({
      destination: destination ?? '다낭',
      duration: parseInt(days ?? '5', 10),
      travelStyle: (travelStyle ?? 'cultural') as any,
      travelers: (travelerType ?? 'couple') as any,
      budget: 1500000,
      interests: [],
      pace: 'moderate',
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
      destination: destination ?? '다낭',
      duration: parseInt(days ?? '5', 10),
      travelStyle: (travelStyle ?? 'cultural') as any,
      travelers: (travelerType ?? 'couple') as any,
      budget: 1500000,
      interests: [],
      pace: 'moderate',
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
              <Text style={styles.summaryStatNum}>₩{(trip.totalEstimatedCost / 10000).toFixed(0)}만</Text>
              <Text style={styles.summaryStatLabel}>{t('aiPlanner.estimatedCost')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Day Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContent}
          style={styles.dayTabs}
        >
          {trip.itinerary.map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayTab, selectedDay === i && styles.dayTabActive]}
              onPress={() => setSelectedDay(i)}
            >
              <Text style={[styles.dayTabLabel, selectedDay === i && styles.dayTabLabelActive]}>DAY {i + 1}</Text>
              <Text style={[styles.dayTabDate, selectedDay === i && styles.dayTabDateActive]}>
                {t('aiPlanner.activities', { count: day.activities.length })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Day Content */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.dayContent}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{t('aiPlanner.day', { number: selectedDay + 1 })} — {dayItinerary.date}</Text>
              {dayItinerary.title && (
                <Text style={styles.dayTheme}>{dayItinerary.title}</Text>
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

            {/* Day Summary */}
            {dayItinerary.estimatedCost > 0 && (
              <View style={styles.dayCostCard}>
                <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
                <Text style={styles.dayCostLabel}>{t('aiPlanner.estimatedCost')}</Text>
                <Text style={styles.dayCostValue}>
                  {dayItinerary.estimatedCost.toLocaleString()}원
                </Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1 },
  loadingGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  loadingTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  loadingSub: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  saveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  saveBtnSaved: { backgroundColor: Colors.primaryLight },
  summaryCard: { marginHorizontal: Spacing.base, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryStat: { alignItems: 'center', gap: 2 },
  summaryStatNum: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFF' },
  summaryStatLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  dayTabs: { marginBottom: Spacing.sm },
  dayTabsContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  dayTab: { minWidth: 72, alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.xl, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  dayTabActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayTabLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase' },
  dayTabLabelActive: { color: Colors.primary },
  dayTabDate: { fontSize: 10, color: Colors.textMuted },
  dayTabDateActive: { color: Colors.primary },
  scroll: { flex: 1 },
  dayContent: { padding: Spacing.base, paddingBottom: 100 },
  dayHeader: { marginBottom: Spacing.lg, gap: Spacing.xs },
  dayTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  dayTheme: { fontSize: FontSize.base, color: Colors.textMuted, fontStyle: 'italic' },
  dayCostCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.md },
  dayCostLabel: { flex: 1, fontSize: FontSize.base, color: Colors.primary, fontWeight: '600' },
  dayCostValue: { fontSize: FontSize.base, fontWeight: '800', color: Colors.primary },
  bottomBar: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  bottomInner: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.sm },
});
