import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useAppData} from '../state/AppDataContext';
import {colors, radii, spacing, typography} from '../theme';

export function OfflineBanner() {
  const {
    isOnline,
    pendingCount,
    syncing,
    syncMessage,
    syncError,
    synchronize,
  } = useAppData();

  if (isOnline && pendingCount === 0 && !syncMessage && !syncError) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, !isOnline && styles.offline]}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {!isOnline
            ? 'Đang ở chế độ offline'
            : syncing
              ? 'Đang đồng bộ dữ liệu...'
              : syncError
                ? 'Chưa thể đồng bộ'
                : syncMessage ?? 'Đã kết nối mạng'}
        </Text>
        {pendingCount > 0 ? (
          <Text style={styles.subtitle}>
            {pendingCount} thao tác đang chờ đồng bộ
          </Text>
        ) : null}
        {syncError ? <Text style={styles.subtitle}>{syncError}</Text> : null}
      </View>
      {isOnline && (pendingCount > 0 || syncError !== null) && !syncing ? (
        <Pressable
          onPress={() => synchronize()}
          accessibilityRole="button"
          accessibilityLabel="Thử đồng bộ lại"
          style={styles.action}>
          <Text style={styles.actionText}>Thử lại</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    backgroundColor: colors.success,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.page,
    paddingVertical: spacing.sm,
  },
  offline: {backgroundColor: colors.surfaceWarm},
  content: {flex: 1, gap: 2},
  title: {color: colors.text, fontSize: typography.caption, fontWeight: '800'},
  subtitle: {color: colors.textSecondary, fontSize: typography.caption},
  action: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
