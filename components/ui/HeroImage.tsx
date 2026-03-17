import React from 'react';
import {
  View, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Spacing } from '../../constants/spacing';

interface HeroImageProps {
  imageUrl: string;
  height?: number;
  /** Show a dark vignette gradient over the image. Default true. */
  gradient?: boolean;
  onBack?: () => void;
  /** Nodes rendered to the right of the back button inside the top action bar. */
  rightActions?: React.ReactNode;
  /** Absolutely-positioned overlay content (e.g. bottom info panel). */
  children?: React.ReactNode;
}

/**
 * Full-width hero image with optional gradient, SafeArea-aware
 * back button, and slots for right-side actions and bottom overlays.
 * Used by hotel, transport and destination detail screens.
 */
export function HeroImage({
  imageUrl,
  height = 300,
  gradient = true,
  onBack,
  rightActions,
  children,
}: HeroImageProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={{ uri: imageUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {gradient && (
        <LinearGradient
          colors={['rgba(0,0,0,0.22)', 'transparent', 'rgba(0,0,0,0.72)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Top action bar */}
      <SafeAreaView
        edges={['top']}
        style={styles.safeOverlay}
        // Allow touches to pass through to children
        pointerEvents="box-none"
      >
        <View style={styles.actionsRow}>
          <HeroButton onPress={onBack ?? (() => router.back())}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </HeroButton>

          {rightActions && (
            <View style={styles.rightRow}>{rightActions}</View>
          )}
        </View>
      </SafeAreaView>

      {/* Overlay slot (e.g. bottom info panel) */}
      {children}
    </View>
  );
}

// ─── HeroButton ────────────────────────────────────────────────────────────────
interface HeroButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
}

/** Circular frosted button for use inside a HeroImage action bar. */
export function HeroButton({ onPress, children }: HeroButtonProps) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.8}>
      {children}
    </TouchableOpacity>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  safeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  rightRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
