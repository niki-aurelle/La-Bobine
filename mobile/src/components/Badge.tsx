import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import { OrderStatus } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  draft:       { label: 'Brouillon',    bg: '#F3F4F6', text: Colors.statusDraft },
  confirmed:   { label: 'Confirmée',   bg: '#EFF6FF', text: Colors.statusConfirmed },
  in_progress: { label: 'En cours',    bg: '#FFFBEB', text: Colors.statusInProgress },
  fitting:     { label: 'Essayage',    bg: '#F5F3FF', text: Colors.statusFitting },
  ready:       { label: 'Prête',       bg: '#ECFDF5', text: Colors.statusReady },
  delivered:   { label: 'Livrée',      bg: '#D1FAE5', text: Colors.statusDelivered },
  cancelled:   { label: 'Annulée',     bg: '#FEF2F2', text: Colors.statusCancelled },
};

interface BadgeProps {
  status: OrderStatus;
  style?: ViewStyle;
}

export function OrderStatusBadge({ status, style }: BadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

interface GenericBadgeProps {
  label: string;
  color?: string;
  bg?: string;
  style?: ViewStyle;
}

export function Badge({ label, color = Colors.primary, bg = Colors.surfaceSecondary, style }: GenericBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 3,
    borderRadius: Sizes.radiusFull,
    alignSelf: 'flex-start',
  },
  text: { fontSize: Sizes.fontXs, fontWeight: '700' },
});
