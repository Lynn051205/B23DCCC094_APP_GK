import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {BookingFormValues, FootballField} from '../types';
import {colors} from '../theme/colors';
import {radius, spacing} from '../theme/spacing';
import {typography} from '../theme/typography';
import {formatCurrency, formatPricePerHour} from '../utils/formatters';
import {computeTotalPrice, getEndHour} from '../utils/bookingUtils';
import {hasErrors, validateBookingForm} from '../utils/validation';
import {FormInput} from './FormInput';
import {OptionButton} from './OptionButton';
import {PrimaryButton} from './PrimaryButton';

type Props = {
  visible: boolean;
  field: FootballField;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: BookingFormValues) => Promise<boolean>;
};

const START_HOURS = Array.from({length: 17}, (_, index) => index + 6);
const HOUR_OPTIONS = [1, 2, 3];

export function BookingModal({
  visible,
  field,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<BookingFormValues>({
    customerName: '',
    phone: '',
    date: '',
    startHour: 17,
    hours: 1,
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateBookingForm>>(
    {},
  );

  useEffect(() => {
    if (visible) {
      setValues({
        customerName: '',
        phone: '',
        date: '',
        startHour: 17,
        hours: 1,
      });
      setErrors({});
    }
  }, [visible]);

  const totalPrice = useMemo(
    () => computeTotalPrice(field.pricePerHour, values.hours),
    [field.pricePerHour, values.hours],
  );

  const handleSubmit = async () => {
    const nextErrors = validateBookingForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors) || submitting) {
      return;
    }
    const saved = await onSubmit(values);
    if (!saved) {
      return;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}>
            <Text style={styles.title}>Đặt sân {field.name}</Text>
            <Text style={styles.subtitle}>
              {formatPricePerHour(field.pricePerHour)}
            </Text>
            <FormInput
              label="Tên khách hàng"
              value={values.customerName}
              onChangeText={customerName =>
                setValues(current => ({...current, customerName}))
              }
              placeholder="Nguyễn Văn A"
              error={errors.customerName}
            />
            <FormInput
              label="Số điện thoại"
              value={values.phone}
              onChangeText={phone => setValues(current => ({...current, phone}))}
              placeholder="0901234567"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />
            <FormInput
              label="Ngày đặt (dd/mm/yyyy)"
              value={values.date}
              onChangeText={date => setValues(current => ({...current, date}))}
              placeholder="28/10/2026"
              keyboardType="numbers-and-punctuation"
              error={errors.date}
            />
            <Text style={styles.groupLabel}>Giờ bắt đầu</Text>
            <View style={styles.options}>
              {START_HOURS.map(hour => (
                <OptionButton
                  key={hour}
                  label={`${hour}h`}
                  selected={values.startHour === hour}
                  onPress={() =>
                    setValues(current => ({...current, startHour: hour}))
                  }
                />
              ))}
            </View>
            {errors.startHour ? (
              <Text style={styles.error}>{errors.startHour}</Text>
            ) : null}
            <Text style={styles.groupLabel}>Số giờ thuê</Text>
            <View style={styles.options}>
              {HOUR_OPTIONS.map(hours => {
                const invalid = getEndHour(values.startHour, hours) > 23;
                return (
                  <OptionButton
                    key={hours}
                    label={`${hours} giờ`}
                    selected={values.hours === hours}
                    disabled={invalid}
                    onPress={() =>
                      setValues(current => ({...current, hours}))
                    }
                  />
                );
              })}
            </View>
            {errors.hours ? <Text style={styles.error}>{errors.hours}</Text> : null}
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Thành tiền</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
            </View>
            <View style={styles.actions}>
              <View style={styles.actionItem}>
                <PrimaryButton label="Hủy" variant="ghost" onPress={onClose} />
              </View>
              <View style={styles.actionItem}>
                <PrimaryButton
                  label={submitting ? 'Đang lưu...' : 'Xác nhận đặt'}
                  disabled={submitting}
                  onPress={() => {
                    handleSubmit().catch(() => undefined);
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.subtitle,
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  groupLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  totalBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.title,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionItem: {
    flex: 1,
  },
});
