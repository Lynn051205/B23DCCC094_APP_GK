import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../theme/colors';
import {radius, spacing} from '../theme/spacing';
import {typography} from '../theme/typography';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function OptionButton({label, selected, onPress, disabled = false}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        selected && styles.selected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text
        style={[
          styles.label,
          selected && styles.selectedLabel,
          disabled && styles.disabledLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.white,
  },
  disabledLabel: {
    color: colors.textSecondary,
  },
});
