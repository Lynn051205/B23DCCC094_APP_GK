import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {FootballField} from '../types';
import {colors} from '../theme/colors';
import {radius, spacing} from '../theme/spacing';
import {typography} from '../theme/typography';
import {formatPricePerHour} from '../utils/formatters';

type Props = {
  field: FootballField;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function FieldCard({field, onPress, onEdit, onDelete}: Props) {
  const isActive = field.status === 'Hoạt động';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.name}>{field.name}</Text>
          <Text style={styles.meta}>
            {field.type} · {formatPricePerHour(field.pricePerHour)}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            isActive ? styles.badgeSuccess : styles.badgeWarning,
          ]}>
          <Text
            style={[
              styles.badgeText,
              isActive ? styles.badgeSuccessText : styles.badgeWarningText,
            ]}>
            {field.status}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onEdit}
          style={({pressed}) => [styles.action, pressed && styles.actionPressed]}>
          <Text style={styles.editText}>Sửa</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({pressed}) => [styles.action, pressed && styles.actionPressed]}>
          <Text style={styles.deleteText}>Xóa</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  pressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(56, 185, 130, 0.16)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 154, 69, 0.16)',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
  },
  badgeSuccessText: {
    color: colors.success,
  },
  badgeWarningText: {
    color: colors.warning,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  actionPressed: {
    opacity: 0.85,
  },
  editText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  deleteText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '700',
  },
});
