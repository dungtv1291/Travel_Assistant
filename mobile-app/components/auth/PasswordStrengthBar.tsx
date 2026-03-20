import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

export function PasswordStrengthBar({ password }: { password: string }) {
  const { t } = useTranslation();

  function measure(pwd: string) {
    if (!pwd) return { level: 0, label: '', color: Colors.border };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: t('auth.passwordStrength.weak'), color: Colors.error };
    if (score === 2) return { level: 2, label: t('auth.passwordStrength.fair'), color: Colors.warning };
    if (score === 3) return { level: 3, label: t('auth.passwordStrength.good'), color: '#16A34A' };
    return { level: 4, label: t('auth.passwordStrength.strong'), color: Colors.success };
  }

  const { level, label, color } = measure(password);
  if (!password) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i <= level ? color : Colors.border }]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
  },
  bar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
});
