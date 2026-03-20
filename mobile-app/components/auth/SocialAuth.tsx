import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radius, Shadow } from '../../constants/spacing';
import { FontSize } from '../../constants/typography';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const PROVIDERS: { id: string; icon: IoniconsName; color: string }[] = [
  { id: 'facebook', icon: 'logo-facebook', color: '#1877F2' },
  { id: 'google',   icon: 'logo-google',   color: '#DB4437' },
  { id: 'apple',    icon: 'logo-apple',    color: '#111827' },
];

interface SocialAuthProps {
  dividerLabel: string;
}

export function SocialAuth({ dividerLabel }: SocialAuthProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{dividerLabel}</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.row}>
        {PROVIDERS.map(p => (
          <TouchableOpacity key={p.id} style={styles.btn} activeOpacity={0.75}>
            <Ionicons name={p.icon} size={20} color={p.color} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  btn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
});
