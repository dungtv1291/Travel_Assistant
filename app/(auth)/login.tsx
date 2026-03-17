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
import { Controller } from 'react-hook-form';
import { useAuthStore } from '../../store/auth.store';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { AuthInput } from '../../components/auth/AuthInput';
import { SocialAuth } from '../../components/auth/SocialAuth';
import { BackButton } from '../../components/auth/BackButton';
import { useLoginForm } from '../../hooks';
import { useTranslation } from '../../hooks/useTranslation';

export default function LoginScreen() {
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useLoginForm({
    email: 'kim.travel@gmail.com',
    password: 'password123',
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(t('auth.loginFailed'), error.message);
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

          {/* Brand mark */}
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons name="compass" size={30} color="#FFF" />
            </View>
            <Text style={styles.brandName}>Travenor</Text>
            <Text style={styles.brandTagline}>{t('auth.tagline')}</Text>
          </View>

          {/* Header */}
          <Text style={styles.title}>{t('auth.login')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

          {/* Form */}
          <View style={styles.form}>
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
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry={!showPw}
                  rightIcon={showPw ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPw(p => !p)}
                  error={errors.password?.message}
                />
              )}
            />
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          {/* CTA */}
          <Button
            title={t('auth.login')}
            onPress={onSubmit}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.cta}
          />

          {/* Social */}
          <SocialAuth dividerLabel={t('auth.orConnect')} />

          {/* Register link */}
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.footerText}>
              {t('auth.noAccount')}{' '}
              <Text style={styles.footerBold}>{t('auth.register')}</Text>
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

  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  brandName: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  brandTagline: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },

  title: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },

  form: { gap: Spacing.base, marginBottom: Spacing.xl },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -Spacing.xs },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: '600',
  },

  cta: { marginBottom: Spacing.xl },

  footerLink: { alignItems: 'center' },
  footerText: { fontSize: FontSize.base, color: Colors.textSecondary },
  footerBold: { color: Colors.primary, fontWeight: '700' },
});
