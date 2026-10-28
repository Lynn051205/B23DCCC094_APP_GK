import React, {useMemo} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/routes';
import {useFields} from '../context/FieldContext';
import {FieldCard} from '../components/FieldCard';
import {EmptyState} from '../components/EmptyState';
import {colors} from '../theme/colors';
import {radius, spacing} from '../theme/spacing';
import {typography} from '../theme/typography';
import type {FootballField} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldList'>;

export function FieldListScreen({navigation}: Props) {
  const {fields, bookings, deleteField} = useFields();

  const stats = useMemo(() => {
    const active = fields.filter(field => field.status === 'Hoạt động').length;
    const maintenance = fields.length - active;
    return {
      total: fields.length,
      active,
      maintenance,
    };
  }, [fields]);

  const handleDelete = (field: FootballField) => {
    const hasBooking = bookings.some(booking => booking.fieldId === field.id);
    if (hasBooking) {
      Alert.alert(
        'Không thể xóa sân',
        'Sân đang có lượt đặt. Hãy hủy hết lịch đặt trước khi xóa sân.',
      );
      return;
    }

    Alert.alert('Xóa sân', `Bạn chắc chắn muốn xóa ${field.name}?`, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          deleteField(field.id).catch(() => undefined);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={fields}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.overline}>FIELD MANAGER</Text>
            <Text style={styles.title}>Quản lý sân bóng</Text>
            <Text style={styles.subtitle}>
              Theo dõi sân mini, lịch đặt và trạng thái vận hành.
            </Text>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>sân</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.success]}>
                  {stats.active}
                </Text>
                <Text style={styles.statLabel}>hoạt động</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.warning]}>
                  {stats.maintenance}
                </Text>
                <Text style={styles.statLabel}>bảo trì</Text>
              </View>
            </View>
            <Text style={styles.summary}>
              {stats.active}/{stats.total} sân hoạt động
            </Text>
            <Pressable
              onPress={() => navigation.navigate('FieldForm')}
              style={({pressed}) => [
                styles.addButton,
                pressed && styles.addPressed,
              ]}>
              <Text style={styles.addLabel}>+ Thêm sân</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Chưa có sân bóng"
            description="Thêm sân đầu tiên để bắt đầu quản lý lịch đặt."
            actionLabel="+ Thêm sân"
            onAction={() => navigation.navigate('FieldForm')}
          />
        }
        renderItem={({item}) => (
          <FieldCard
            field={item}
            onPress={() => navigation.navigate('FieldDetail', {fieldId: item.id})}
            onEdit={() => navigation.navigate('FieldForm', {fieldId: item.id})}
            onDelete={() => handleDelete(item)}
          />
        )}
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
  header: {
    marginBottom: spacing.lg,
  },
  overline: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  stats: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  success: {
    color: colors.success,
  },
  warning: {
    color: colors.warning,
  },
  summary: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  addButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPressed: {
    backgroundColor: colors.primaryPressed,
  },
  addLabel: {
    ...typography.button,
    color: colors.white,
  },
  separator: {
    height: spacing.md,
  },
});

function ListSeparator() {
  return <View style={styles.separator} />;
}
