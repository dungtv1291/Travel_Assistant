import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
import { useRegisterForm } from '../../hooks';
import { useTranslation } from '../../hooks/useTranslation';

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useRegisterForm();

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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.register')}</Text>
            <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.name')}</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                      <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="홍길동"
                        placeholderTextColor={Colors.textMuted}
                        autoCapitalize="words"
                      />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                      <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="email@example.com"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.password')}</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('auth.passwordHint')}
                        placeholderTextColor={Colors.textMuted}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        placeholderTextColor={Colors.textMuted}
                        secureTextEntry
                      />
                    </View>
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                  </>
                )}
              />
            </View>
          </View>

          <Button title={t('auth.register')} onPress={onSubmit} loading={isLoading} fullWidth size="lg" style={styles.registerBtn} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.orConnect')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social icon row */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#1877F2' }]}>
              <Ionicons name="logo-facebook" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#DB4437' }]}>
              <Ionicons name="logo-google" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#000000' }]}>
              <Ionicons name="logo-apple" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.loginText}>
              {t('auth.hasAccount')} <Text style={styles.loginBold}>{t('auth.login')}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.xl },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  header: { marginBottom: Spacing['2xl'], gap: Spacing.sm },
  title: { fontSize: FontSize['4xl'], fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary },
  form: { gap: Spacing.base, marginBottom: Spacing.xl },
  field: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, paddingVertical: 0 },
  registerBtn: { marginBottom: Spacing.xl },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: 2 },
  inputError: { borderWidth: 1, borderColor: Colors.error },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginBottom: Spacing.base },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.textMuted },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl, marginBottom: Spacing.xl },
  socialIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: FontSize.base, color: Colors.textSecondary },
  loginBold: { color: Colors.primary, fontWeight: '700' },
});
