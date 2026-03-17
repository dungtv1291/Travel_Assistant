import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/auth.store';
import { useBookingsStore } from '../../store/bookings.store';
import { useTripsStore } from '../../store/trips.store';
import { useLanguageStore } from '../../store/language.store';
import { useThemeStore } from '../../store/theme.store';
import { useTranslation } from '../../hooks/useTranslation';

const TRAVEL_STYLE_ICONS: Record<string, string> = {
  cultural: 'library-outline', beach: 'sunny-outline', adventure: 'bicycle-outline',
  food: 'restaurant-outline', foodie: 'restaurant-outline', shopping: 'bag-outline', relaxation: 'leaf-outline',
};

export default function ProfileScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { user, logout } = useAuthStore();
  const { hotelBookings, transportBookings } = useBookingsStore();
  const { savedTrips, favorites } = useTripsStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { locale, setLocale } = useLanguageStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { t } = useTranslation();

  const LOCALE_LABELS: Record<string, string> = {
    ko: t('languages.ko'), en: t('languages.en'), vi: t('languages.vi'),
  };

  const totalBookings = hotelBookings.length + transportBookings.length;

  const handleLanguagePress = () => {
    Alert.alert(t('profile.selectLanguage'), '', [
      { text: t('languages.ko'),  onPress: () => setLocale('ko') },
      { text: t('languages.en'),  onPress: () => setLocale('en') },
      { text: t('languages.vi'),  onPress: () => setLocale('vi') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/welcome'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero header */}
        <LinearGradient
          colors={[Colors.primary, Colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroTitle}>{t('profile.title')}</Text>
            <TouchableOpacity style={styles.editIconBtn} onPress={() => router.push('/profile-edit' as any)}>
              <Ionicons name="pencil-outline" size={17} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroBody}>
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() ?? 'K'}</Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Text style={{ fontSize: 14 }}>🇰🇷</Text>
              </View>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{user?.name ?? t('home.traveler')}</Text>
              <Text style={styles.heroEmail}>{user?.email ?? 'traveler@korea.com'}</Text>
              <TouchableOpacity style={styles.editBadge} onPress={() => router.push('/profile-edit' as any)}>
                <Ionicons name="pencil-outline" size={12} color={Colors.primary} />
                <Text style={styles.editBadgeText}>{t('profile.editBadge')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Activity stats */}
        <View style={styles.statsCard}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/trips')}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="map-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{savedTrips.length}</Text>
            <Text style={styles.statLabel}>{t('profile.tripCount')}</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/bookings')}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accentLight }]}>
              <Ionicons name="receipt-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: Colors.accent }]}>{totalBookings}</Text>
            <Text style={styles.statLabel}>{t('profile.bookingCount')}</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/trips')}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="heart-outline" size={18} color="#D97706" />
            </View>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{favorites.length}</Text>
            <Text style={styles.statLabel}>{t('profile.favoriteCount')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick actions */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t('profile.myActivity')}</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => router.push('/(tabs)/trips')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuLabel}>{t('profile.savedTrips')}</Text>
                  <Text style={styles.menuSub}>{t('profile.savedTripsSub')}</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                {savedTrips.length > 0 && <View style={styles.badgePill}><Text style={styles.badgeText}>{savedTrips.length}</Text></View>}
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => router.push('/(tabs)/bookings')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: Colors.accentLight }]}>
                  <Ionicons name="receipt-outline" size={18} color={Colors.accent} />
                </View>
                <View>
                  <Text style={styles.menuLabel}>{t('profile.bookingHistory')}</Text>
                  <Text style={styles.menuSub}>{t('profile.bookingHistorySub')}</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                {totalBookings > 0 && <View style={[styles.badgePill, { backgroundColor: Colors.accent }]}><Text style={styles.badgeText}>{totalBookings}</Text></View>}
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/trips')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="heart-outline" size={18} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>{t('profile.favoriteDest')}</Text>
                  <Text style={styles.menuSub}>{t('profile.favoriteDestSub')}</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                {favorites.length > 0 && <View style={[styles.badgePill, { backgroundColor: '#D97706' }]}><Text style={styles.badgeText}>{favorites.length}</Text></View>}
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Travel identity */}
        {user?.preferences && (user.preferences.travelStyle.length > 0 || user.preferences.interests.length > 0) && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>{t('profile.travelStyleSection')}</Text>
            <View style={styles.menuCard}>
              {user.preferences.travelStyle.length > 0 && (
                <View style={[styles.identityRow, styles.menuRowBorder]}>
                  <Ionicons name="compass-outline" size={16} color={Colors.primary} />
                  <Text style={styles.identityKey}>{t('profile.travelStyleType')}</Text>
                  <View style={styles.chipWrap}>
                    {user.preferences.travelStyle.map(s => {
                      const icon = TRAVEL_STYLE_ICONS[s] ?? 'compass-outline';
                      const label = t(`profile.travelStyleLabels.${s}` as any) || s;
                      return (
                        <View key={s} style={styles.styleChip}>
                          <Ionicons name={icon as any} size={12} color={Colors.primary} />
                          <Text style={styles.styleChipText}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
              {user.preferences.interests.length > 0 && (
                <View style={styles.identityRow}>
                  <Ionicons name="heart-outline" size={16} color={Colors.accent} />
                  <Text style={styles.identityKey}>{t('profile.travelStyleInterests')}</Text>
                  <View style={styles.chipWrap}>
                    {user.preferences.interests.slice(0, 5).map(int => (
                      <View key={int} style={[styles.styleChip, styles.styleChipAccent]}>
                        <Text style={[styles.styleChipText, { color: Colors.accent }]}>{int}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── App settings */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t('profile.settings')}</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={handleLanguagePress}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="language-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{t('profile.appLanguage')}</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={styles.menuValue}>{LOCALE_LABELS[locale] ?? locale}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
            <View style={[styles.menuRow, styles.menuRowBorder]}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#1E293B' : Colors.primaryLight }]}>
                  <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={18} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{t('profile.darkMode')}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: Colors.border, true: Colors.primary + '88' }}
                thumbColor={isDark ? Colors.primary : '#FFF'}
              />
            </View>
            <View style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuLabel}>{t('profile.notifications')}</Text>
                  <Text style={styles.menuSub}>{t('profile.notificationsSub')}</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.border, true: Colors.primary + '88' }}
                thumbColor={notificationsEnabled ? Colors.primary : '#FFF'}
              />
            </View>
          </View>
        </View>

        {/* ── Privacy / legal */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t('profile.legalSection')}</Text>
          <View style={styles.menuCard}>
            {[
              { label: t('profile.privacyPolicy'),  icon: 'shield-checkmark-outline' },
              { label: t('profile.serviceTerms'),   icon: 'document-text-outline' },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i === 0 && styles.menuRowBorder]}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: Colors.surfaceSecondary }]}>
                    <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Support */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t('profile.supportSection')}</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuLabel}>{t('profile.customerService')}</Text>
                  <Text style={styles.menuSub}>{t('profile.customerServiceSub')}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: Colors.surfaceSecondary }]}>
                  <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
                </View>
                <Text style={styles.menuLabel}>{t('profile.appVersion')}</Text>
              </View>
              <Text style={styles.menuValue}>v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* ── Logout */}
        <View style={styles.sectionBlock}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerFlag}>{t('profile.footer')}</Text>
          <Text style={styles.footerSub}>{t('profile.footerSub')}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe:   { flex: 1, backgroundColor: Colors.background },
    scroll: { paddingBottom: 100 },

    // Hero
    hero:      { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.xl + 4 },
    heroTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    heroTitle: { fontSize: FontSize['2xl'], fontWeight: '800', color: '#FFF' },
    editIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    heroBody:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    avatarWrapper: { position: 'relative' },
    avatar:    { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FFF' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
    avatarInitial: { fontSize: 32, fontWeight: '800', color: '#FFF' },
    avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
    heroInfo:  { flex: 1, gap: 4 },
    heroName:  { fontSize: FontSize.xl, fontWeight: '800', color: '#FFF' },
    heroEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)' },
    editBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: '#FFF', marginTop: 4 },
    editBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },

    // Stats
    statsCard:   { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.xl, marginHorizontal: Spacing.base, marginTop: -Spacing.lg, padding: Spacing.lg, ...Shadow.md },
    statItem:    { flex: 1, alignItems: 'center', gap: 6 },
    statIcon:    { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    statValue:   { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
    statLabel:   { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
    statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 8 },

    // Sections
    sectionBlock: { marginTop: Spacing.xl, paddingHorizontal: Spacing.base },
    sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },

    // Menu card shared
    menuCard:      { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
    menuRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: 14 },
    menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuLeft:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    menuIconBox:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    menuLabel:     { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
    menuSub:       { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
    menuRight:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    menuValue:     { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
    badgePill:     { backgroundColor: Colors.primary, borderRadius: 10, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
    badgeText:     { fontSize: 11, fontWeight: '700', color: '#FFF' },

    // Identity
    identityRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
    identityKey:  { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, minWidth: 64, marginTop: 1 },
    chipWrap:     { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    styleChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
    styleChipAccent: { backgroundColor: Colors.accentLight },
    styleChipText:   { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },

    // Logout
    logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 15, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: '#EF444466', backgroundColor: '#FEF2F2' },
    logoutText: { fontSize: FontSize.base, fontWeight: '700', color: '#EF4444' },

    // Footer
    footer:    { alignItems: 'center', paddingVertical: Spacing.xl, gap: 4 },
    footerFlag: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
    footerSub:  { fontSize: FontSize.xs, color: Colors.textMuted },
  });
}

