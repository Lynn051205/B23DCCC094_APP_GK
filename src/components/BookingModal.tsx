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

const START_HOURS = Array.from({length: 17}, (_, index) => index + 6); // 6 to 22
const HOUR_OPTIONS = [1, 2, 3];

export function BookingModal({
  visible,
  field,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [startHourText, setStartHourText] = useState('17');
  const [hoursText, setHoursText] = useState('1');
  const [errors, setErrors] = useState<ReturnType<typeof validateBookingForm>>({});

  useEffect(() => {
    if (visible) {
      setCustomerName('');
      setPhone('');
      setDate('');
      setStartHourText('17');
      setHoursText('1');
      setErrors({});
    }
  }, [visible]);

  const parsedStartHour = useMemo(() => {
    const val = parseInt(startHourText.trim(), 10);
    return Number.isNaN(val) ? 0 : val;
  }, [startHourText]);

  const parsedHours = useMemo(() => {
    const val = parseInt(hoursText.trim(), 10);
    return Number.isNaN(val) ? 0 : val;
  }, [hoursText]);

  const totalPrice = useMemo(
    () => computeTotalPrice(field.pricePerHour, parsedHours),
    [field.pricePerHour, parsedHours],
  );

  const handleFillToday = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    setDate(`${d}/${m}/${y}`);
  };

  const handleSelectStartHour = (hour: number) => {
    setStartHourText(String(hour));
    if (errors.startHour) {
      setErrors(prev => ({...prev, startHour: undefined}));
    }
  };

  const handleSelectHours = (hours: number) => {
    setHoursText(String(hours));
    if (errors.hours) {
      setErrors(prev => ({...prev, hours: undefined}));
    }
  };

  const handleSubmit = async () => {
    const formValues: BookingFormValues = {
      customerName,
      phone,
      date,
      startHour: parsedStartHour,
      hours: parsedHours,
    };

    const nextErrors = validateBookingForm(formValues);
    setErrors(nextErrors);

    if (hasErrors(nextErrors) || submitting) {
      return;
    }

    const saved = await onSubmit(formValues);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text style={styles.title}>Đặt sân {field.name}</Text>
                <Text style={styles.subtitle}>
                  {field.type} · {formatPricePerHour(field.pricePerHour)}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={({pressed}) => [styles.closeBtn, pressed && styles.closePressed]}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <FormInput
              label="Tên khách hàng"
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Nguyễn Văn A"
              error={errors.customerName}
            />

            <FormInput
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              placeholder="0901234567"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />

            <View style={styles.dateLabelRow}>
              <Text style={styles.groupLabel}>Ngày đặt (dd/mm/yyyy)</Text>
              <Pressable
                onPress={handleFillToday}
                style={({pressed}) => [styles.quickDate, pressed && styles.pressed]}>
                <Text style={styles.quickDateText}>Hôm nay</Text>
              </Pressable>
            </View>
            <FormInput
              label=""
              value={date}
              onChangeText={setDate}
              placeholder="dd/mm/yyyy (ví dụ: 28/10/2026)"
              keyboardType="default"
              maxLength={10}
              error={errors.date}
            />

            <Text style={styles.groupLabel}>Giờ bắt đầu (từ 6h đến 22h)</Text>
            <FormInput
              label=""
              value={startHourText}
              onChangeText={setStartHourText}
              placeholder="6 - 22"
              keyboardType="numeric"
              maxLength={2}
              error={errors.startHour}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChips}>
              {START_HOURS.map(hour => (
                <View key={hour} style={styles.hourChipWrap}>
                  <OptionButton
                    label={`${hour}h`}
                    selected={parsedStartHour === hour}
                    onPress={() => handleSelectStartHour(hour)}
                  />
                </View>
              ))}
            </ScrollView>

            <Text style={styles.groupLabel}>Số giờ thuê (từ 1 đến 3 giờ)</Text>
            <FormInput
              label=""
              value={hoursText}
              onChangeText={setHoursText}
              placeholder="1 - 3"
              keyboardType="numeric"
              maxLength={1}
              error={errors.hours}
            />
            <View style={styles.hoursRow}>
              {HOUR_OPTIONS.map(hours => {
                const invalid = getEndHour(parsedStartHour, hours) > 23;
                return (
                  <View key={hours} style={styles.hourOptionWrap}>
                    <OptionButton
                      label={`${hours} giờ`}
                      selected={parsedHours === hours}
                      disabled={invalid}
                      onPress={() => handleSelectHours(hours)}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.totalBox}>
              <View>
                <Text style={styles.totalLabel}>Thành tiền</Text>
                <Text style={styles.totalFormula}>
                  {formatCurrency(field.pricePerHour)} × {parsedHours} giờ
                </Text>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  closeBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  closePressed: {
    opacity: 0.6,
  },
  closeText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  dateLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickDate: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  quickDateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  groupLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  horizontalChips: {
    paddingBottom: spacing.md,
  },
  hourChipWrap: {
    marginRight: spacing.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  hourOptionWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  totalBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalFormula: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  totalValue: {
    ...typography.title,
    fontSize: 22,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
  },
  actionItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
