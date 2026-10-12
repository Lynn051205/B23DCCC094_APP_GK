import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  Assignment,
  ClassSession,
  Course,
  Grade,
} from '../data/learningData';
import {colorForCourse, weekdayNames} from '../data/learningData';
import {useAppData} from '../state/AppDataContext';
import {colors, radii, spacing, typography} from '../theme';

export function Page({children}: React.PropsWithChildren) {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function ScreenTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.screenTitle}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: React.PropsWithChildren<{style?: object}>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.secondaryButton, pressed && styles.pressed]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      accessibilityLabel={placeholder}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      value={value}
      onChangeText={onChangeText}
      style={styles.search}
      returnKeyType="search"
      clearButtonMode="while-editing"
    />
  );
}

export function StatusBadge({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const badgeStyle = {
    neutral: styles.badgeNeutral,
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    danger: styles.badgeDanger,
  }[variant];
  const textStyle = variant === 'danger' ? styles.dangerText : styles.badgeText;
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyMark}>
        <Text style={styles.emptyMarkText}>—</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? (
        <Text style={styles.emptyDescription}>{description}</Text>
      ) : null}
    </Card>
  );
}

export function DemoNotice() {
  return (
    <View style={styles.demoNotice}>
      <Text style={styles.demoNoticeText}>
        Nội dung môn học, lịch và bài tập bên dưới là dữ liệu minh họa.
      </Text>
    </View>
  );
}

export function CourseCard({
  course,
  onPress,
}: {
  course: Course;
  onPress: () => void;
}) {
  const {schedule, assignments} = useAppData();
  const classCount = schedule.filter(item => item.courseId === course.id).length;
  const taskCount = assignments.filter(item => item.courseId === course.id).length;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        styles.courseCard,
        {borderLeftColor: colorForCourse(course.id)},
        pressed && styles.pressed,
      ]}>
      <View style={styles.cardTopRow}>
        <Text style={styles.courseCode}>{course.code}</Text>
        <Text style={styles.courseCredits}>{course.credits} tín chỉ</Text>
      </View>
      <Text style={styles.cardTitle}>{course.name}</Text>
      <Text style={styles.cardMeta}>{course.instructor}</Text>
      <Text style={styles.cardMeta}>
        {classCount} buổi học · {taskCount} bài tập
      </Text>
    </Pressable>
  );
}

export function AssignmentCard({
  assignment,
  onPress,
  onToggle,
}: {
  assignment: Assignment;
  onPress: () => void;
  onToggle?: () => void;
}) {
  const {courses} = useAppData();
  const course = courses.find(item => item.id === assignment.courseId);
  const overdue = !assignment.completed && new Date(assignment.dueAt) < new Date();
  const dueLabel = new Date(assignment.dueAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({pressed}) => pressed && styles.pressed}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardMeta}>{course?.code ?? 'Môn học'}</Text>
          <StatusBadge
            label={
              assignment.completed
                ? 'Hoàn thành'
                : overdue
                  ? 'Quá hạn'
                  : 'Chưa hoàn thành'
            }
            variant={
              assignment.completed ? 'success' : overdue ? 'danger' : 'warning'
            }
          />
        </View>
        <Text style={styles.cardTitle}>{assignment.title}</Text>
        <Text style={styles.cardMeta}>Hạn nộp: {dueLabel}</Text>
      </Pressable>
      {onToggle ? (
        <SecondaryButton
          label={
            assignment.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'
          }
          onPress={onToggle}
        />
      ) : null}
    </View>
  );
}

export function ScheduleCard({
  session,
  onPress,
}: {
  session: ClassSession;
  onPress: () => void;
}) {
  const {courses} = useAppData();
  const course = courses.find(item => item.id === session.courseId);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.scheduleCard,
        {backgroundColor: colorForCourse(session.courseId)},
        pressed && styles.pressed,
      ]}>
      <Text style={styles.courseCode}>{course?.code ?? 'Môn học'}</Text>
      <Text style={styles.cardTitle}>{course?.name ?? 'Chưa xác định môn học'}</Text>
      <Text style={styles.cardMeta}>
        Tiết {session.startPeriod}–{session.endPeriod} · {session.startTime}–{session.endTime}
      </Text>
      <Text style={styles.cardMeta}>
        {weekdayNames[session.weekday % 7]} · Phòng {session.room}
      </Text>
    </Pressable>
  );
}

export function GradeCard({
  grade,
  onPress,
}: {
  grade: Grade;
  onPress: () => void;
}) {
  const {courses} = useAppData();
  const course = courses.find(item => item.id === grade.courseId);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardTopRow}>
        <Text style={styles.courseCode}>{course?.code ?? 'Môn học'}</Text>
        <Text style={styles.gradeScore}>{grade.total.toFixed(1)}</Text>
      </View>
      <Text style={styles.cardTitle}>{course?.name ?? 'Kết quả học tập'}</Text>
      <Text style={styles.cardMeta}>{grade.term}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {flex: 1, backgroundColor: colors.background},
  pageContent: {padding: spacing.page, paddingBottom: 36, gap: spacing.lg},
  screenTitle: {gap: spacing.xs, marginBottom: spacing.xs},
  title: {color: colors.text, fontSize: typography.title, fontWeight: '800'},
  subtitle: {color: colors.textSecondary, fontSize: typography.body, lineHeight: 22},
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {color: colors.text, fontSize: typography.heading, fontWeight: '700'},
  actionText: {color: colors.textSecondary, fontSize: typography.body, fontWeight: '700'},
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  courseCard: {borderLeftWidth: 5},
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  courseCode: {color: colors.textSecondary, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.6},
  courseCredits: {color: colors.textSecondary, fontSize: typography.caption},
  cardTitle: {color: colors.text, fontSize: typography.subheading, fontWeight: '700', lineHeight: 23},
  cardMeta: {color: colors.textSecondary, fontSize: typography.body, lineHeight: 21},
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {color: colors.text, fontSize: typography.body, fontWeight: '800'},
  disabledButton: {opacity: 0.45},
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {color: colors.text, fontSize: typography.caption, fontWeight: '700'},
  pressed: {opacity: 0.76},
  search: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.sm,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  badge: {borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs},
  badgeNeutral: {backgroundColor: colors.navigation},
  badgeSuccess: {backgroundColor: colors.success},
  badgeWarning: {backgroundColor: colors.surfaceWarm},
  badgeDanger: {backgroundColor: colors.dangerSurface},
  badgeText: {color: colors.text, fontSize: typography.caption, fontWeight: '700'},
  dangerText: {color: colors.danger, fontSize: typography.caption, fontWeight: '800'},
  emptyCard: {alignItems: 'center', backgroundColor: colors.surfaceWarm, paddingVertical: spacing.xxl},
  emptyMark: {alignItems: 'center', backgroundColor: colors.navigation, borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44},
  emptyMarkText: {color: colors.text, fontSize: typography.heading, fontWeight: '700'},
  emptyTitle: {color: colors.text, fontSize: typography.subheading, fontWeight: '700', textAlign: 'center'},
  emptyDescription: {color: colors.textSecondary, fontSize: typography.body, lineHeight: 22, textAlign: 'center'},
  demoNotice: {backgroundColor: colors.surfaceWarm, borderRadius: radii.sm, padding: spacing.md},
  demoNoticeText: {color: colors.textSecondary, fontSize: typography.caption, lineHeight: 18},
  scheduleCard: {borderRadius: radii.md, gap: spacing.sm, padding: spacing.lg},
  gradeScore: {color: colors.text, fontSize: typography.heading, fontWeight: '800'},
});
