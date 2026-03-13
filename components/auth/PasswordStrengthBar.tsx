import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';

interface StrengthResult {
  level: number;
  label: string;
  color: string;
}

function measure(password: string): StrengthResult {
  if (!password) return { level: 0, label: '', color: Colors.border };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: '취약', color: Colors.error };
  if (score === 2) return { level: 2, label: '보통', color: Colors.warning };
  if (score === 3) return { level: 3, label: '양호', color: '#16A34A' };
  return { level: 4, label: '강함', color: Colors.success };
}

export function PasswordStrengthBar({ password }: { password: string }) {
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
