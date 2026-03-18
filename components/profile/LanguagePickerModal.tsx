/**
 * LanguagePickerModal
 *
 * A bottom-sheet style modal that lets the user pick an app language.
 * On selection: switches i18next locale + persists to AsyncStorage
 * immediately, so every component re-renders in the new language.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguageStore } from '../../store/language.store';
import { Spacing, Radius, Shadow } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import type { SupportedLocale } from '../../src/i18n';

// ── Language option config ────────────────────────────────────────────────────

interface LangOption {
  locale: SupportedLocale;
  flag: string;
  nativeName: string;
}

const LANGUAGE_OPTIONS: LangOption[] = [
  { locale: 'ko', flag: '🇰🇷', nativeName: '한국어' },
  { locale: 'en', flag: '🇺🇸', nativeName: 'English' },
  { locale: 'vi', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LanguagePickerModal({
  visible,
  onClose,
}: LanguagePickerModalProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
  const { t } = useTranslation();
  const { locale, setLocale } = useLanguageStore();

  const handleSelect = (selected: SupportedLocale) => {
    if (selected !== locale) {
      setLocale(selected); // updates i18next + AsyncStorage
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dim backdrop — tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.selectLanguage')}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Language options */}
        <View style={styles.optionList}>
          {LANGUAGE_OPTIONS.map((item, index) => {
            const isSelected = locale === item.locale;
            const isLast = index === LANGUAGE_OPTIONS.length - 1;

            return (
              <TouchableOpacity
                key={item.locale}
                style={[
                  styles.optionRow,
                  !isLast && styles.optionBorder,
                  isSelected && styles.optionRowSelected,
                ]}
                onPress={() => handleSelect(item.locale)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{item.flag}</Text>

                <View style={styles.optionText}>
                  <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
                    {item.nativeName}
                  </Text>
                  <Text style={styles.localizedName}>
                    {t(`languages.${item.locale}` as any)}
                  </Text>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Safe-area bottom padding */}
        <View style={styles.safeBottom} />
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(Colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.surface,
      borderTopLeftRadius: Radius['2xl'],
      borderTopRightRadius: Radius['2xl'],
      paddingTop: Spacing.sm,
      ...Shadow.lg,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.border,
      marginBottom: Spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    title: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionList: {
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.sm,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.lg,
      gap: Spacing.md,
    },
    optionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    optionRowSelected: {
      backgroundColor: Colors.primaryLight,
    },
    flag: {
      fontSize: 28,
    },
    optionText: {
      flex: 1,
      gap: 2,
    },
    nativeName: {
      fontSize: FontSize.base,
      fontWeight: '600',
      color: Colors.textPrimary,
    },
    selectedText: {
      color: Colors.primary,
    },
    localizedName: {
      fontSize: FontSize.sm,
      color: Colors.textMuted,
    },
    safeBottom: {
      height: Platform.OS === 'ios' ? 34 : 20,
    },
  });
}
