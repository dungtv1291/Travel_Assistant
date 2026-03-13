import React, { useState , useMemo} from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../hooks/useThemeColors';
import { Spacing, Radius } from '../constants/spacing';
import { FontSize } from '../constants/typography';
import { useAuthStore } from '../store/auth.store';
import { useTranslation } from '../hooks/useTranslation';

export default function ProfileEditScreen() {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { user, updateUser } = useAuthStore();
  const { t } = useTranslation();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('profile.namePlaceholder'));
      return;
    }
    updateUser({ name: name.trim(), phone: phone.trim() || undefined });
    Alert.alert(t('common.success'), t('profile.saveSuccess'), [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Name field */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('profile.name')}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>

            {/* Email field (read-only) */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('profile.email')}</Text>
              <View style={styles.inputReadonly}>
                <Text style={styles.inputReadonlyText}>{user?.email ?? ''}</Text>
                <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />
              </View>
            </View>

            {/* Phone field */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('profile.phone')}</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('profile.phonePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>

            {/* Save button */}
            <TouchableOpacity style={styles.saveFullBtn} onPress={handleSave}>
              <Text style={styles.saveFullBtnText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary,
  },
  saveBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
  },
  saveBtnText: {
    fontSize: FontSize.sm, fontWeight: '700', color: '#FFF',
  },
  scroll: {
    padding: Spacing.base, gap: Spacing.lg,
  },
  section: { gap: Spacing.xs },
  label: {
    fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.textPrimary,
  },
  inputReadonly: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputReadonlyText: {
    fontSize: FontSize.base, color: Colors.textMuted,
  },
  saveFullBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveFullBtnText: {
    fontSize: FontSize.base, fontWeight: '700', color: '#FFF',
  },
  });
}
