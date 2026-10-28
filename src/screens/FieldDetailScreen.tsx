import React, {useMemo, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/routes';
import {useFields} from '../context/FieldContext';
import {BookingCard} from '../components/BookingCard';
import {BookingModal} from '../components/BookingModal';
import {EmptyState} from '../components/EmptyState';
import {PrimaryButton} from '../components/PrimaryButton';
import {colors} from '../theme/colors';
import {radius, spacing} from '../theme/spacing';
import {typography} from '../theme/typography';
import {formatPricePerHour} from '../utils/formatters';
import type {BookingFormValues} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldDetail'>;

export function FieldDetailScreen({navigation, route}: Props) {
  const {fieldId} = route.params;
  const {fields, bookings, addBooking, cancelBooking} = useFields();
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const field = fields.find(item => item.id === fieldId);
  const fieldBookings = useMemo(
    () => bookings.filter(item => item.fieldId === fieldId),
    [bookings, fieldId],
  );

  if (!field) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <EmptyState
            title="Không tìm thấy sân"
            description="Sân này có thể đã bị xóa. Quay lại danh sách để tiếp tục."
            actionLabel="Quay lại"
            onAction={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isMaintenance = field.status === 'Bảo trì';

  const handleCreateBooking = async (values: BookingFormValues) => {
    setSubmitting(true);
    try {
      const result = await addBooking({
        fieldId: field.id,
        customerName: values.customerName,
        phone: values.phone,
        date: values.date,
        startHour: values.startHour,
        hours: values.hours,
      });
      if (!result.ok) {
        Alert.alert('Không thể đặt sân', result.message ?? 'Vui lòng thử lại.');
        return false;
      }
      setModalVisible(false);
      return true;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert('Hủy lượt đặt', 'Bạn chắc chắn muốn hủy lượt đặt này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xác nhận',
        style: 'destructive',
        onPress: () => {
          cancelBooking(bookingId).catch(() => undefined);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.name}>{field.name}</Text>
          <Text style={styles.meta}>
            {field.type} · {formatPricePerHour(field.pricePerHour)}
          </Text>
          <Text
            style={[
              styles.status,
              isMaintenance ? styles.warning : styles.success,
            ]}>
            {field.status}
          </Text>
          <Text style={styles.count}>{fieldBookings.length} lượt đặt</Text>
        </View>
        {isMaintenance ? (
          <Text style={styles.maintenanceNote}>
            Sân đang bảo trì, không thể đặt sân
          </Text>
        ) : null}
        <PrimaryButton
          label="Đặt sân"
          disabled={isMaintenance}
          onPress={() => setModalVisible(true)}
        />
        <Text style={styles.sectionTitle}>Lịch đặt</Text>
        {fieldBookings.length === 0 ? (
          <EmptyState
            title="Chưa có lượt đặt"
            description="Sân này chưa có lịch thuê nào."
          />
        ) : (
          <View style={styles.list}>
            {fieldBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                pricePerHour={field.pricePerHour}
                onCancel={() => handleCancelBooking(booking.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <BookingModal
        visible={modalVisible}
        field={field}
        submitting={submitting}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateBooking}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  name: {
    ...typography.title,
    fontSize: 24,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  status: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  success: {
    color: colors.success,
  },
  warning: {
    color: colors.warning,
  },
  count: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  maintenanceNote: {
    ...typography.body,
    color: colors.warning,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
});
