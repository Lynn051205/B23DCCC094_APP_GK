import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {
  Assignment,
  Profile,
} from '../data/learningData';
import {
  colorForCourse,
  grades,
  weekdayNames,
} from '../data/learningData';
import type {RootStackParamList, RootTabParamList} from '../navigation/routes';
import {useAppData} from '../state/AppDataContext';
import {
  AssignmentCard,
  Card,
  CourseCard,
  DemoNotice,
  EmptyState,
  GradeCard,
  Page,
  PrimaryButton,
  ScheduleCard,
  ScreenTitle,
  SearchField,
  SectionHeading,
  SecondaryButton,
  StatusBadge,
} from '../components/ui';
import {colors, radii, spacing, typography} from '../theme';

type AppNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const useAppNavigation = () => useNavigation<AppNavigation>();

function isOverdue(assignment: Assignment): boolean {
  return !assignment.completed && new Date(assignment.dueAt).getTime() < Date.now();
}

function dueSoon(assignment: Assignment): boolean {
  const daysLeft =
    (new Date(assignment.dueAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
  return !assignment.completed && daysLeft >= 0 && daysLeft <= 7;
}

export function OverviewScreen() {
  const navigation = useAppNavigation();
  const {courses, assignments, profile} = useAppData();
  const openAssignments = assignments.filter(item => !item.completed);
  const upcoming = [...openAssignments]
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 3);

  return (
    <Page>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>KHÔNG GIAN HỌC TẬP CỦA BẠN</Text>
        <Text style={styles.heroTitle}>
          Xin chào{profile.name ? `, ${profile.name.split(' ')[0]}` : ', bạn'}!
        </Text>
        <Text style={styles.heroSubtitle}>
          Một chút tiến bộ mỗi ngày sẽ tạo nên khác biệt.
        </Text>
        <Text style={styles.profileSummary}>
          {profile.studentId ? `Mã SV ${profile.studentId}` : 'Cập nhật hồ sơ cá nhân'}
        </Text>
      </View>

      <DemoNotice />

      <View style={styles.statsRow}>
        <StatCard label="Môn học" value={String(courses.length)} tint={colors.course} />
        <StatCard label="Chưa xong" value={String(openAssignments.length)} tint={colors.progress} />
        <StatCard label="Sắp đến hạn" value={String(assignments.filter(dueSoon).length)} tint={colors.surfaceWarm} />
      </View>

      <SectionHeading
        title="Môn học của bạn"
        action="Xem tất cả"
        onAction={() => navigation.navigate('Courses')}
      />
      {courses.slice(0, 3).map(course => (
        <CourseCard
          key={course.id}
          course={course}
          onPress={() => navigation.navigate('CourseDetail', {courseId: course.id})}
        />
      ))}

      <SectionHeading
        title="Bài tập sắp tới"
        action="Xem tất cả"
        onAction={() => navigation.navigate('Assignments')}
      />
      {upcoming.length ? (
        upcoming.map(assignment => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onPress={() =>
              navigation.navigate('AssignmentDetail', {
                assignmentId: assignment.id,
              })
            }
          />
        ))
      ) : (
        <EmptyState
          title="Bạn đã hoàn thành mọi bài tập"
          description="Các bài tập mới sẽ xuất hiện tại đây."
        />
      )}

      <SectionHeading title="Truy cập nhanh" />
      <View style={styles.shortcutRow}>
        <Shortcut label="Thời khóa biểu" symbol="▦" onPress={() => navigation.navigate('Schedule')} />
        <Shortcut label="Hồ sơ" symbol="○" onPress={() => navigation.navigate('Profile')} />
      </View>
    </Page>
  );
}

function StatCard({label, value, tint}: {label: string; value: string; tint: string}) {
  return (
    <View style={[styles.statCard, {backgroundColor: tint}]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Shortcut({
  label,
  symbol,
  onPress,
}: {
  label: string;
  symbol: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.shortcut, pressed && styles.pressed]}>
      <Text style={styles.shortcutSymbol}>{symbol}</Text>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );
}

export function CoursesScreen() {
  const navigation = useAppNavigation();
  const {courses} = useAppData();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi');
    return courses.filter(
      course =>
        course.name.toLocaleLowerCase('vi').includes(normalized) ||
        course.code.toLocaleLowerCase('vi').includes(normalized),
    );
  }, [courses, query]);

  return (
    <FlatList
      style={styles.listScreen}
      contentContainerStyle={styles.listContent}
      data={filtered}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <ScreenTitle
            title="Môn học"
            subtitle={`${courses.length} môn trong học kỳ này`}
          />
          <DemoNotice />
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm theo tên hoặc mã môn"
          />
        </View>
      }
      renderItem={({item}) => (
        <CourseCard
          course={item}
          onPress={() => navigation.navigate('CourseDetail', {courseId: item.id})}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          title="Không tìm thấy môn học"
          description="Thử tìm bằng tên hoặc mã môn khác."
        />
      }
      ItemSeparatorComponent={ListGap}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function ScheduleScreen() {
  const navigation = useAppNavigation();
  const {schedule} = useAppData();
  const sections = useMemo(
    () =>
      Array.from({length: 7}, (_, index) => {
        const weekday = index + 1;
        const data = schedule
          .filter(session => session.weekday === weekday)
          .sort((a, b) => a.startPeriod - b.startPeriod);
        return {
          title: weekdayNames[weekday % 7],
          weekday,
          data: data.length ? data : [null],
        };
      }),
    [schedule],
  );

  return (
    <SectionList
      style={styles.listScreen}
      contentContainerStyle={styles.listContent}
      sections={sections}
      keyExtractor={(item, index) => item?.id ?? `empty-${index}`}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <ScreenTitle title="Thời khóa biểu" subtitle={`${schedule.length} buổi học mỗi tuần`} />
          <DemoNotice />
        </View>
      }
      renderSectionHeader={({section}) => (
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{section.title}</Text>
          <StatusBadge
            label={`${section.data[0] ? section.data.length : 0} buổi`}
            variant="neutral"
          />
        </View>
      )}
      renderItem={({item}) =>
        item ? (
          <ScheduleCard
            session={item}
            onPress={() =>
              navigation.navigate('ScheduleDetail', {sessionId: item.id})
            }
          />
        ) : (
          <Text style={styles.dayEmpty}>Chưa có lịch học</Text>
        )
      }
      ItemSeparatorComponent={ListGap}
      SectionSeparatorComponent={SectionGap}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function AssignmentsScreen() {
  const navigation = useAppNavigation();
  const {assignments, toggleAssignment} = useAppData();
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const filtered = useMemo(
    () =>
      [...assignments]
        .filter(item =>
          filter === 'all'
            ? true
            : filter === 'done'
              ? item.completed
              : !item.completed,
        )
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    [assignments, filter],
  );
  const options = [
    {key: 'all', label: 'Tất cả'},
    {key: 'open', label: 'Cần làm'},
    {key: 'done', label: 'Hoàn thành'},
  ] as const;

  return (
    <FlatList
      style={styles.listScreen}
      contentContainerStyle={styles.listContent}
      data={filtered}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <ScreenTitle title="Bài tập" subtitle="Theo dõi hạn nộp và tiến độ của bạn." />
          <DemoNotice />
          <View style={styles.filterRow}>
            {options.map(option => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                onPress={() => setFilter(option.key)}
                style={[
                  styles.filterChip,
                  filter === option.key && styles.filterChipActive,
                ]}>
                <Text
                  style={[
                    styles.filterText,
                    filter === option.key && styles.filterTextActive,
                  ]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      renderItem={({item}) => (
        <AssignmentCard
          assignment={item}
          onPress={() =>
            navigation.navigate('AssignmentDetail', {assignmentId: item.id})
          }
          onToggle={() => toggleAssignment(item.id)}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          title="Không có bài tập trong danh sách"
          description="Khi có bài tập, thông tin sẽ được hiển thị tại đây."
        />
      }
      ItemSeparatorComponent={ListGap}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function ProfileScreen() {
  const navigation = useAppNavigation();
  const {profile} = useAppData();
  const rows = [
    ['Mã sinh viên', profile.studentId],
    ['Lớp', profile.className],
    ['Ngành học', profile.major],
    ['Email', profile.email],
    ['Số điện thoại', profile.phone],
  ];

  return (
    <Page>
      <ScreenTitle title="Cá nhân" subtitle="Hồ sơ và kết quả học tập." />
      <DemoNotice />
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.name ? profile.name.trim().charAt(0).toLocaleUpperCase('vi') : '•'}
          </Text>
        </View>
        <Text style={styles.profileName}>{profile.name || 'Tên sinh viên'}</Text>
        <Text style={styles.profileMeta}>
          {profile.studentId || 'Chưa cập nhật mã sinh viên'}
        </Text>
      </Card>
      <Card>
        {rows.map(([label, value]) => (
          <InfoRow
            key={label}
            label={label}
            value={value || 'Chưa cập nhật'}
          />
        ))}
        <PrimaryButton
          label="Chỉnh sửa thông tin"
          onPress={() => navigation.navigate('EditProfile')}
        />
      </Card>

      <SectionHeading title="Kết quả học tập" />
      {grades.length ? (
        grades.map(grade => (
          <GradeCard
            key={grade.id}
            grade={grade}
            onPress={() => navigation.navigate('GradeDetail', {gradeId: grade.id})}
          />
        ))
      ) : (
        <EmptyState
          title="Chưa có kết quả học tập"
          description="Điểm số chỉ xuất hiện khi có dữ liệu học tập được cung cấp."
        />
      )}
    </Page>
  );
}

export function EditProfileScreen() {
  const navigation = useAppNavigation();
  const {profile, updateProfile} = useAppData();
  const [form, setForm] = useState(profile);
  const fields: {key: keyof Profile; label: string; keyboard?: 'email-address' | 'phone-pad'}[] = [
    {key: 'name', label: 'Họ và tên'},
    {key: 'studentId', label: 'Mã sinh viên'},
    {key: 'className', label: 'Lớp'},
    {key: 'major', label: 'Ngành học'},
    {key: 'email', label: 'Email', keyboard: 'email-address'},
    {key: 'phone', label: 'Số điện thoại', keyboard: 'phone-pad'},
  ];

  const save = () => {
    if (!form.name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên.');
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert('Email chưa hợp lệ', 'Vui lòng kiểm tra lại địa chỉ email.');
      return;
    }
    updateProfile({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    Alert.alert('Đã lưu', 'Thông tin cá nhân đã được cập nhật.');
    navigation.goBack();
  };

  return (
    <Page>
      <ScreenTitle title="Chỉnh sửa hồ sơ" subtitle="Thông tin được lưu trên thiết bị này." />
      <Card>
        {fields.map(field => (
          <View key={field.key} style={styles.formField}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              accessibilityLabel={field.label}
              keyboardType={field.keyboard ?? 'default'}
              autoCapitalize={field.key === 'email' ? 'none' : 'words'}
              value={form[field.key]}
              onChangeText={value => setForm(current => ({...current, [field.key]: value}))}
              placeholder={`${field.label} (tùy chọn)`}
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>
        ))}
        <PrimaryButton label="Lưu thông tin" onPress={save} />
        <SecondaryButton label="Hủy" onPress={() => navigation.goBack()} />
      </Card>
    </Page>
  );
}

export function CourseDetailScreen() {
  const navigation = useAppNavigation();
  const {courses, schedule, assignments} = useAppData();
  const route = useRoute();
  const courseId = (route.params as RootStackParamList['CourseDetail']).courseId;
  const course = courses.find(item => item.id === courseId);
  const sessions = schedule
    .filter(item => item.courseId === courseId)
    .sort((a, b) => a.weekday - b.weekday || a.startPeriod - b.startPeriod);
  const tasks = assignments.filter(item => item.courseId === courseId);

  if (!course) {
    return <MissingData title="Không tìm thấy môn học" />;
  }
  return (
    <Page>
      <View style={[styles.courseHero, {backgroundColor: colorForCourse(course.id)}]}>
        <Text style={styles.eyebrow}>{course.code} · {course.credits} tín chỉ</Text>
        <Text style={styles.heroTitle}>{course.name}</Text>
        <Text style={styles.heroSubtitle}>{course.description}</Text>
      </View>
      <Card>
        <InfoRow label="Giảng viên" value={course.instructor} />
        <InfoRow label="Phòng học" value={course.room} />
      </Card>
      <SectionHeading title="Buổi học" />
      {sessions.length ? (
        sessions.map(session => (
          <ScheduleCard
            key={session.id}
            session={session}
            onPress={() => navigation.navigate('ScheduleDetail', {sessionId: session.id})}
          />
        ))
      ) : (
        <EmptyState title="Chưa có lịch học cho môn này" />
      )}
      <SectionHeading title="Bài tập môn học" />
      {tasks.length ? (
        tasks.map(task => (
          <AssignmentCard
            key={task.id}
            assignment={task}
            onPress={() => navigation.navigate('AssignmentDetail', {assignmentId: task.id})}
          />
        ))
      ) : (
        <EmptyState title="Chưa có bài tập cho môn này" />
      )}
    </Page>
  );
}

export function ScheduleDetailScreen() {
  const {schedule, courses} = useAppData();
  const route = useRoute();
  const sessionId = (route.params as RootStackParamList['ScheduleDetail']).sessionId;
  const session = schedule.find(item => item.id === sessionId);
  if (!session) {
    return <MissingData title="Không tìm thấy buổi học" />;
  }
  const course = courses.find(item => item.id === session.courseId);
  return (
    <Page>
      <View
        style={[
          styles.courseHero,
          {backgroundColor: colorForCourse(session.courseId)},
        ]}>
        <Text style={styles.eyebrow}>{course?.code ?? 'MÔN HỌC'}</Text>
        <Text style={styles.heroTitle}>{course?.name ?? 'Buổi học'}</Text>
        <Text style={styles.heroSubtitle}>
          {weekdayNames[session.weekday % 7]} · Tiết {session.startPeriod}–{session.endPeriod}
        </Text>
      </View>
      <Card>
        <InfoRow label="Giờ học" value={`${session.startTime} – ${session.endTime}`} />
        <InfoRow label="Phòng học" value={session.room} />
        <InfoRow label="Giảng viên" value={course?.instructor ?? 'Chưa cập nhật'} />
      </Card>
    </Page>
  );
}

export function AssignmentDetailScreen() {
  const navigation = useAppNavigation();
  const {assignments, courses, toggleAssignment} = useAppData();
  const route = useRoute();
  const assignmentId = (route.params as RootStackParamList['AssignmentDetail']).assignmentId;
  const assignment = assignments.find(item => item.id === assignmentId);
  if (!assignment) {
    return <MissingData title="Không tìm thấy bài tập" />;
  }
  const course = courses.find(item => item.id === assignment.courseId);
  const overdue = isOverdue(assignment);
  return (
    <Page>
      <ScreenTitle title={assignment.title} subtitle={course?.name ?? 'Môn học'} />
      <Card>
        <InfoRow label="Mã môn" value={course?.code ?? 'Chưa cập nhật'} />
        <InfoRow
          label="Hạn nộp"
          value={new Date(assignment.dueAt).toLocaleString('vi-VN')}
        />
        <InfoRow
          label="Trạng thái"
          value={assignment.completed ? 'Hoàn thành' : overdue ? 'Quá hạn' : 'Chưa hoàn thành'}
        />
        <View style={styles.descriptionBlock}>
          <Text style={styles.fieldLabel}>Mô tả</Text>
          <Text style={styles.bodyText}>{assignment.description || 'Chưa có mô tả.'}</Text>
        </View>
        {overdue ? (
          <Text style={styles.overdueNotice}>
            Bài tập này đã quá hạn và chưa được đánh dấu hoàn thành.
          </Text>
        ) : null}
        <PrimaryButton
          label={assignment.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
          onPress={() => {
            toggleAssignment(assignment.id);
            navigation.goBack();
          }}
        />
      </Card>
    </Page>
  );
}

export function GradeDetailScreen() {
  const {courses} = useAppData();
  const route = useRoute();
  const gradeId = (route.params as RootStackParamList['GradeDetail']).gradeId;
  const grade = grades.find(item => item.id === gradeId);
  if (!grade) {
    return <MissingData title="Chưa có dữ liệu kết quả" />;
  }
  const course = courses.find(item => item.id === grade.courseId);
  return (
    <Page>
      <ScreenTitle title="Kết quả học tập" subtitle={course?.name ?? 'Môn học'} />
      <Card>
        <InfoRow label="Mã môn" value={course?.code ?? 'Chưa cập nhật'} />
        <InfoRow label="Học kỳ" value={grade.term} />
        <InfoRow label="Điểm tổng kết" value={grade.total.toFixed(1)} />
      </Card>
      <SectionHeading title="Điểm thành phần" />
      {grade.components?.length ? (
        <Card>
          {grade.components.map(component => (
            <InfoRow
              key={component.label}
              label={component.label}
              value={component.score.toFixed(1)}
            />
          ))}
        </Card>
      ) : (
        <EmptyState title="Chưa có điểm thành phần" />
      )}
    </Page>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.bodyText}>{value}</Text>
    </View>
  );
}

function MissingData({title}: {title: string}) {
  return (
    <Page>
      <EmptyState title={title} description="Dữ liệu có thể đã bị thay đổi hoặc không còn tồn tại." />
    </Page>
  );
}

function ListGap() {
  return <View style={styles.listGap} />;
}

function SectionGap() {
  return <View style={styles.sectionGap} />;
}

const styles = StyleSheet.create({
  listScreen: {backgroundColor: colors.background, flex: 1},
  listContent: {gap: spacing.md, padding: spacing.page, paddingBottom: 36},
  listHeader: {gap: spacing.lg, marginBottom: spacing.xs},
  hero: {backgroundColor: colors.surfaceWarm, borderRadius: radii.lg, gap: spacing.sm, padding: spacing.xl},
  heroTitle: {color: colors.text, fontSize: typography.title, fontWeight: '800', lineHeight: 36},
  heroSubtitle: {color: colors.textSecondary, fontSize: typography.body, lineHeight: 23},
  profileSummary: {color: colors.text, fontSize: typography.caption, fontWeight: '700', marginTop: spacing.xs},
  eyebrow: {color: colors.textSecondary, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.8},
  statsRow: {flexDirection: 'row', gap: spacing.sm},
  statCard: {alignItems: 'flex-start', borderRadius: radii.md, flex: 1, gap: spacing.xs, minHeight: 88, justifyContent: 'center', padding: spacing.md},
  statValue: {color: colors.text, fontSize: typography.heading, fontWeight: '800'},
  statLabel: {color: colors.textSecondary, fontSize: typography.caption, lineHeight: 16},
  shortcutRow: {flexDirection: 'row', gap: spacing.md},
  shortcut: {alignItems: 'center', backgroundColor: colors.navigation, borderRadius: radii.md, flex: 1, gap: spacing.sm, minHeight: 92, justifyContent: 'center', padding: spacing.md},
  shortcutSymbol: {color: colors.text, fontSize: 24, fontWeight: '700'},
  shortcutLabel: {color: colors.text, fontSize: typography.caption, fontWeight: '700', textAlign: 'center'},
  pressed: {opacity: 0.75},
  dayHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm},
  dayTitle: {color: colors.text, fontSize: typography.heading, fontWeight: '800'},
  dayEmpty: {backgroundColor: colors.surfaceWarm, borderRadius: radii.sm, color: colors.textSecondary, fontSize: typography.body, padding: spacing.md},
  sectionGap: {height: spacing.lg},
  listGap: {height: spacing.md},
  filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  filterChip: {backgroundColor: colors.navigation, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm},
  filterChipActive: {backgroundColor: colors.primary},
  filterText: {color: colors.textSecondary, fontSize: typography.caption, fontWeight: '700'},
  filterTextActive: {color: colors.text},
  profileCard: {alignItems: 'center', backgroundColor: colors.course, paddingVertical: spacing.xl},
  avatar: {alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, height: 76, justifyContent: 'center', width: 76},
  avatarText: {color: colors.text, fontSize: 30, fontWeight: '700'},
  profileName: {color: colors.text, fontSize: typography.heading, fontWeight: '800'},
  profileMeta: {color: colors.textSecondary, fontSize: typography.body},
  infoRow: {borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.xs, paddingVertical: spacing.md},
  formField: {gap: spacing.xs, marginBottom: spacing.sm},
  fieldLabel: {color: colors.textSecondary, fontSize: typography.caption, fontWeight: '700'},
  bodyText: {color: colors.text, fontSize: typography.body, lineHeight: 23},
  input: {backgroundColor: colors.surfaceWarm, borderRadius: radii.sm, color: colors.text, fontSize: typography.body, minHeight: 48, paddingHorizontal: spacing.md},
  courseHero: {borderRadius: radii.lg, gap: spacing.md, padding: spacing.xl},
  descriptionBlock: {gap: spacing.sm, paddingVertical: spacing.md},
  overdueNotice: {backgroundColor: colors.dangerSurface, borderRadius: radii.sm, color: colors.danger, fontSize: typography.body, lineHeight: 22, padding: spacing.md},
});
