import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useWatch } from 'react-hook-form';
import { useAuthStore } from '../../store/auth.store';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar';
import { SocialAuth } from '../../components/auth/SocialAuth';
import { BackButton } from '../../components/auth/BackButton';
import { useRegisterForm } from '../../hooks';
import { useTranslation } from '../../hooks/useTranslation';

const PWD_REQUIREMENTS = [
  { label: '8자 이상', check: (p: string) => p.length >= 8 },
  { label: '대문자 포함', check: (p: string) => /[A-Z]/.test(p) },
  { label: '숫자 포함', check: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterScreen() {
  const [showPw, setShowPw] = useState(false);
  const { register, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useRegisterForm();
  const watchedPassword = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = handleSubmit(async ({ name, email, password, confirmPassword }) => {
    try {
      await register(name, email, password, confirmPassword);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(t('auth.registerFailed'), error.message);
    }
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <BackButton style={{ marginBottom: Spacing['2xl'] }} />

          {/* Header */}
          <Text style={styles.title}>{t('auth.register')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label={t('auth.name')}
                  icon="person-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="홍길동"
                  autoCapitalize="words"
                  error={errors.name?.message}
                />
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label={t('auth.email')}
                  icon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('auth.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            {/* Password + strength */}
            <View style={styles.passwordSection}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label={t('auth.password')}
                    icon="lock-closed-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('auth.passwordHint')}
                    secureTextEntry={!showPw}
                    rightIcon={showPw ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => setShowPw(p => !p)}
                    error={errors.password?.message}
                  />
                )}
              />
              {watchedPassword.length > 0 && (
                <>
                  <PasswordStrengthBar password={watchedPassword} />
                  <View style={styles.requirements}>
                    {PWD_REQUIREMENTS.map(req => {
                      const met = req.check(watchedPassword);
                      return (
                        <View key={req.label} style={styles.reqItem}>
                          <Ionicons
                            name={met ? 'checkmark-circle' : 'ellipse-outline'}
                            size={13}
                            color={met ? Colors.success : Colors.textMuted}
                          />
                          <Text style={[styles.reqText, met && styles.reqMet]}>
                            {req.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>

            {/* Confirm password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label={t('auth.confirmPassword')}
                  icon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          {/* CTA */}
          <Button
            title={t('auth.register')}
            onPress={onSubmit}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.cta}
          />

          {/* Social */}
          <SocialAuth dividerLabel={t('auth.orConnect')} />

          {/* Login link */}
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.footerText}>
              {t('auth.hasAccount')}{' '}
              <Text style={styles.footerBold}>{t('auth.login')}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.xl },

  title: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },

  form: { gap: Spacing.base, marginBottom: Spacing.xl },

  passwordSection: { gap: Spacing.sm },
  requirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingLeft: 2,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reqText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  reqMet: { color: Colors.success, fontWeight: '600' },

  cta: { marginBottom: Spacing.xl },

  footerLink: { alignItems: 'center' },
  footerText: { fontSize: FontSize.base, color: Colors.textSecondary },
  footerBold: { color: Colors.primary, fontWeight: '700' },
});
