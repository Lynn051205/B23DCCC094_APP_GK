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
      <Text style={styles.meta}>Số điện thoại: {booking.phone}</Text>
      <Text style={styles.meta}>
        Thời gian: {booking.date} · {formatTimeRange(booking.startHour, booking.hours)}
      </Text>
      <Text style={styles.meta}>Thời lượng: {booking.hours} giờ thuê</Text>
      <Text style={styles.total}>Thành tiền: {formatCurrency(total)}</Text>
      <Pressable
        onPress={onCancel}
        style={({pressed}) => [styles.cancel, pressed && styles.pressed]}>
        <Text style={styles.cancelText}>Hủy đặt sân</Text>
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
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  name: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  total: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  cancel: {
    minHeight: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pressed: {
    backgroundColor: 'rgba(240, 100, 112, 0.12)',
  },
  cancelText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '700',
  },
});
