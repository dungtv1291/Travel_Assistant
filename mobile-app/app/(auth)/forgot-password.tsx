import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import { authService } from '../../services/mock/auth.service';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { AuthInput } from '../../components/auth/AuthInput';
import { BackButton } from '../../components/auth/BackButton';
import { useForgotPasswordForm } from '../../hooks';
import { useTranslation } from '../../hooks/useTranslation';

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForgotPasswordForm();

  const onSubmit = handleSubmit(async ({ email }) => {
    setLoading(true);
    try {
      await authService.sendPasswordReset(email);
      setSentEmail(email);
      setSent(true);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Back */}
          <BackButton style={{ marginBottom: Spacing.xl }} />

          {!sent ? (
            /* ── Request form ── */
            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={32} color="#FFF" />
              </View>

              <View style={styles.header}>
                <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
                <Text style={styles.subtitle}>
                  {t('auth.forgotPasswordSubtitle')}
                </Text>
              </View>

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

              <Button
                title={t('auth.sendResetLink')}
                onPress={onSubmit}
                loading={loading}
                fullWidth
                size="lg"
              />

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.backLinkText}>{t('auth.backToLogin')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Success state ── */
            <View style={styles.success}>
              <View style={styles.successIcon}>
                <Ionicons name="mail-open-outline" size={40} color="#FFF" />
              </View>

              <Text style={styles.successTitle}>{t('auth.checkEmail')}</Text>
              <Text style={styles.successSubtitle}>
                {t('auth.resetSent', { email: sentEmail })}
              </Text>

              <Button
                title={t('auth.backToLogin')}
                onPress={() => router.replace('/(auth)/login')}
                fullWidth
                size="lg"
                style={styles.successCta}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  flex: { flex: 1 },
  container: { flex: 1, padding: Spacing.xl },

  /* Request form */
  content: { gap: Spacing.xl },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  header: { gap: Spacing.sm },
  title: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  backLinkText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  /* Success */
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  successCta: {},
});
