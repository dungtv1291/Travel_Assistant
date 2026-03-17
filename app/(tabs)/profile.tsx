import React, { useState , useMemo} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { Spacing, Shadow, Radius } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/auth.store';
import { useBookingsStore } from '../../store/bookings.store';
import { useTripsStore } from '../../store/trips.store';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguageStore } from '../../store/language.store';
import { useThemeStore } from '../../store/theme.store';

const TRAVEL_STYLE_LABELS: Record<string, string> = {
  cultural: '🏛️ 문화 탐방',
  beach: '🏖️ 해변',
  adventure: '🧗 액티비티',
  food: '🍜 미식',
  foodie: '🍜 미식',
  shopping: '🛍️ 쇼핑',
  relaxation: '🧘 힐링',
};

export default function ProfileScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { user, logout } = useAuthStore();
  const { hotelBookings, transportBookings } = useBookingsStore();
  const { savedTrips, favorites } = useTripsStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { t } = useTranslation();
  const { locale, setLocale } = useLanguageStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLanguagePress = () => {
    Alert.alert(t('profile.selectLanguage'), '', [
      { text: '한국어', onPress: () => setLocale('ko') },
      { text: 'English', onPress: () => setLocale('en') },
      { text: 'Tiếng Việt', onPress: () => setLocale('vi') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: t('profile.myActivity'),
      items: [
        { label: t('profile.savedTrips'), icon: 'calendar-outline', route: '/(tabs)/trips', badge: savedTrips.length },
        { label: t('profile.bookingHistory'), icon: 'receipt-outline', route: '/(tabs)/bookings', badge: hotelBookings.length + transportBookings.length },
        { label: t('profile.favoriteDest'), icon: 'heart-outline', route: '/(tabs)/trips', badge: favorites.length },
      ],
    },
    {
      title: t('profile.settings'),
      items: [
        { label: t('profile.appLanguage'), icon: 'language-outline', value: t(`languages.${locale}`), onPress: handleLanguagePress },
        { label: t('profile.darkMode'), icon: 'moon-outline', value: null, darkToggle: true, route: null },
        { label: t('profile.notifications'), icon: 'notifications-outline', value: null, toggle: true, route: null },
        { label: t('profile.privacy'), icon: 'shield-outline', route: null },
        { label: t('profile.terms'), icon: 'document-text-outline', route: null },
      ],
    },
    {
      title: t('profile.support'),
      items: [
        { label: t('profile.customerService'), icon: 'help-circle-outline', route: null },
        { label: t('profile.appVersion'), icon: 'information-circle-outline', value: '1.0.0', route: null },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <TouchableOpacity style={styles.editIconBtn} onPress={() => router.push('/profile-edit' as any)}>
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Avatar + User Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'K'}
                </Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>🇰🇷</Text>
            </View>
          </View>

          <Text style={styles.userName}>{user?.name ?? t('home.traveler')}</Text>
          <Text style={styles.userEmail}>{user?.email ?? 'traveler@korea.com'}</Text>

          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile-edit' as any)}>
            <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
            <Text style={styles.editBtnText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row — Travenor / reference 3-col style */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/trips')}>
            <Text style={styles.statValue}>{savedTrips.length}</Text>
            <Text style={styles.statLabel}>{t('profile.tripCount')}</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/bookings')}>
            <Text style={styles.statValue}>{hotelBookings.length + transportBookings.length}</Text>
            <Text style={styles.statLabel}>{t('profile.bookingCount')}</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/trips')}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>{t('profile.favoriteCount')}</Text>
          </TouchableOpacity>
        </View>

        {/* Travel Identity */}
        {user?.preferences && (user.preferences.travelStyle.length > 0 || user.preferences.interests.length > 0) && (
          <View style={styles.identitySection}>
            <Text style={styles.identitySectionTitle}>{t('profile.travelIdentity')}</Text>
            <View style={styles.identityCard}>
              {user.preferences.travelStyle.length > 0 && (
                <View style={styles.identityRow}>
                  <Ionicons name="compass-outline" size={16} color={Colors.primary} />
                  <Text style={styles.identityRowLabel}>{t('profile.travelStyle')}</Text>
                  <View style={styles.identityChips}>
                    {user.preferences.travelStyle.map(style => (
                      <View key={style} style={styles.identityChip}>
                        <Text style={styles.identityChipText}>
                          {TRAVEL_STYLE_LABELS[style] ?? style}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {user.preferences.interests.length > 0 && (
                <View style={[styles.identityRow, styles.identityRowBorder]}>
                  <Ionicons name="heart-outline" size={16} color={Colors.accent} />
                  <Text style={styles.identityRowLabel}>{t('profile.interests')}</Text>
                  <View style={styles.identityChips}>
                    {user.preferences.interests.slice(0, 4).map(interest => (
                      <View key={interest} style={[styles.identityChip, styles.identityChipAccent]}>
                        <Text style={[styles.identityChipText, styles.identityChipTextAccent]}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Menu Sections */}
        {menuSections.map(section => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuRow, i < section.items.length - 1 && styles.menuRowBorder]}
                  onPress={
                    (item as any).onPress
                      ? (item as any).onPress
                      : item.route
                      ? () => router.push(item.route as any)
                      : undefined
                  }
                  activeOpacity={(item as any).onPress || item.route ? 0.7 : 1}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconBox}>
                      <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuRight}>
                    {(item as any).value && !(item as any).toggle && (
                      <Text style={styles.menuValue}>{(item as any).value}</Text>
                    )}
                    {'badge' in item && (item as any).badge > 0 && (
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>{(item as any).badge}</Text>
                      </View>
                    )}
                    {(item as any).darkToggle ? (
                      <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: Colors.border, true: Colors.primary + '66' }}
                        thumbColor={isDark ? Colors.primary : Colors.textMuted}
                      />
                    ) : (item as any).toggle ? (
                      <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: Colors.border, true: Colors.primary + '66' }}
                        thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
                      />
                    ) : (item.route || (item as any).onPress) ? (
                      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🇻🇳 Vietnam Travel Assistant for Korean Travelers</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: '800', color: Colors.textPrimary },
  editIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  profileCard: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.base, gap: Spacing.sm },
  avatarWrapper: { position: 'relative', marginBottom: Spacing.sm },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primary },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primaryLight },
  avatarInitial: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background },
  avatarBadgeText: { fontSize: 16 },
  userName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  userEmail: { fontSize: FontSize.sm, color: Colors.textMuted },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.primary, marginTop: Spacing.xs },
  editBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadow.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.accent },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  menuSection: { marginBottom: Spacing.md, paddingHorizontal: Spacing.base },
  menuSectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  menuValue: { fontSize: FontSize.sm, color: Colors.textMuted },
  badgePill: { backgroundColor: Colors.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.base, marginVertical: Spacing.md, paddingVertical: Spacing.md, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: '#EF4444' },
  logoutText: { fontSize: FontSize.base, fontWeight: '700', color: '#EF4444' },
  footer: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
  footerText: { fontSize: FontSize.xs, color: Colors.textMuted },
  footerVersion: { fontSize: 11, color: Colors.border },

  // Travel Identity
  identitySection: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.base },
  identitySectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  identityCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  identityRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.sm },
  identityRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  identityRowLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  identityChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, flex: 1 },
  identityChip: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  identityChipAccent: { backgroundColor: Colors.accentLight },
  identityChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },
  identityChipTextAccent: { color: Colors.accent },
  });
}
