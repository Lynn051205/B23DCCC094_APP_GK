import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../theme/colors';
import {radius, spacing} from '../theme/spacing';
import {typography} from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        pressed && !disabled && variant === 'primary' && styles.primaryPressed,
        pressed && !disabled && variant === 'danger' && styles.dangerPressed,
        pressed && !disabled && variant === 'ghost' && styles.ghostPressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  dangerPressed: {
    opacity: 0.86,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  label: {
    ...typography.button,
    color: colors.white,
  },
  disabledLabel: {
    color: colors.textSecondary,
  },
});
