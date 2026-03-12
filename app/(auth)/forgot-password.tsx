import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/mock/auth.service';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const handleSend = async () => {
    if (!email.trim()) { Alert.alert(t('common.error'), t('auth.emailRequired')); return; }
    setLoading(true);
    try {
      await authService.sendPasswordReset(email);
      setSent(true);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          {!sent ? (
            <>
              <View style={styles.header}>
                <Text style={styles.emoji}>🔑</Text>
                <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
                <Text style={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <Button title={t('auth.sendResetLink')} onPress={handleSend} loading={loading} fullWidth size="lg" style={styles.btn} />
            </>
          ) : (
            <View style={styles.successBlock}>
              <Text style={styles.successEmoji}>📧</Text>
              <Text style={styles.successTitle}>{t('auth.checkEmail')}</Text>
              <Text style={styles.successSubtitle}>{t('auth.resetSent', { email })}</Text>
              <Button title={t('auth.backToLogin')} onPress={() => router.replace('/(auth)/login')} fullWidth size="lg" style={styles.btn} />
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
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  header: { marginBottom: Spacing['2xl'], gap: Spacing.sm },
  emoji: { fontSize: 40 },
  title: { fontSize: FontSize['4xl'], fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, lineHeight: 24 },
  field: { gap: Spacing.sm, marginBottom: Spacing.xl },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md, gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, paddingVertical: 0 },
  btn: { marginTop: Spacing.base },
  successBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base },
  successEmoji: { fontSize: 64 },
  successTitle: { fontSize: FontSize['3xl'], fontWeight: '800', color: Colors.textPrimary },
  successSubtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
