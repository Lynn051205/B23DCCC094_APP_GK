import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {Booking} from '../types';
import {colors} from '../theme/colors';
import {radius, spacing} from '../theme/spacing';
import {typography} from '../theme/typography';
import {formatCurrency, formatTimeRange} from '../utils/formatters';
import {computeTotalPrice} from '../utils/bookingUtils';

type Props = {
  booking: Booking;
  pricePerHour: number;
  onCancel: () => void;
};

export function BookingCard({booking, pricePerHour, onCancel}: Props) {
  const total = computeTotalPrice(pricePerHour, booking.hours);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{booking.customerName}</Text>
      <Text style={styles.meta}>{booking.phone}</Text>
      <Text style={styles.meta}>
        {booking.date} · {formatTimeRange(booking.startHour, booking.hours)}
      </Text>
      <Text style={styles.meta}>{booking.hours} giờ thuê</Text>
      <Text style={styles.total}>Thành tiền: {formatCurrency(total)}</Text>
      <Pressable
        onPress={onCancel}
        style={({pressed}) => [styles.cancel, pressed && styles.pressed]}>
        <Text style={styles.cancelText}>Hủy đặt</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  total: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  cancel: {
    marginTop: spacing.sm,
    minHeight: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  cancelText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '700',
  },
});
