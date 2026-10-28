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
        text: 'Xác nhận hủy',
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
          <View style={styles.heroHeader}>
            <View style={styles.heroLeft}>
              <Text style={styles.name}>{field.name}</Text>
              <Text style={styles.meta}>
                {field.type} · {formatPricePerHour(field.pricePerHour)}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                isMaintenance ? styles.badgeWarning : styles.badgeSuccess,
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  isMaintenance ? styles.badgeWarningText : styles.badgeSuccessText,
                ]}>
                {field.status}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroFooter}>
            <Text style={styles.countText}>
              Đang có <Text style={styles.countHighlight}>{fieldBookings.length}</Text> lượt đặt
            </Text>
          </View>
        </View>

        {isMaintenance ? (
          <View style={styles.maintenanceBanner}>
            <Text style={styles.maintenanceIcon}>⚠️</Text>
            <Text style={styles.maintenanceNote}>
              Sân đang bảo trì, không thể đặt sân lúc này.
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          label="Đặt sân"
          disabled={isMaintenance}
          onPress={() => setModalVisible(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh sách lịch đặt</Text>
          <Text style={styles.sectionSubtitle}>
            ({fieldBookings.length} lượt)
          </Text>
        </View>

        {fieldBookings.length === 0 ? (
          <EmptyState
            title="Chưa có lượt đặt"
            description="Sân này chưa có lịch thuê nào. Nhấn 'Đặt sân' để tạo lượt đặt mới."
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
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.title,
    fontSize: 22,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  heroDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  countHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  maintenanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 154, 69, 0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 154, 69, 0.3)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  maintenanceIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  maintenanceNote: {
    ...typography.body,
    color: colors.warning,
    flex: 1,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
});
