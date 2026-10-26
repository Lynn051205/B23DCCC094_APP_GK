import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {
  Assignment,
  Profile,
} from '../data/learningData';
import {colorForCourse, weekdayNames} from '../data/learningData';
import type {
  AssignmentsStackParamList,
  CoursesStackParamList,
  ProfileStackParamList,
  RootTabParamList,
  ScheduleStackParamList,
} from '../navigation/routes';
import {useAppData} from '../state/AppDataContext';
import type {DataStatus} from '../state/AppDataContext';
import {
  AssignmentCard,
  CacheTimestamp,
  Card,
  CourseCard,
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
import type {
  AssignmentCreate,
  AssignmentStatus,
} from '../api/types';
import {calculateWeightedGpa} from '../utils/grades';
import {parseDueDate} from '../utils/dates';
import {BASE_URL} from '../api/config';
import {colors, radii, spacing, typography} from '../theme';

type CourseNavigation = NativeStackNavigationProp<CoursesStackParamList>;
type ScheduleNavigation = NativeStackNavigationProp<ScheduleStackParamList>;
type AssignmentNavigation = NativeStackNavigationProp<AssignmentsStackParamList>;
type ProfileNavigation = NativeStackNavigationProp<ProfileStackParamList>;
type TabsNavigation = BottomTabNavigationProp<RootTabParamList>;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isOverdue(assignment: Assignment): boolean {
  return !assignment.completed && new Date(assignment.dueAt).getTime() < Date.now();
}

function RequestStatus({
  status,
  onRetry,
}: {
  status: DataStatus;
  onRetry: () => void;
}) {
  if (status.loading) {
    return (
      <View style={styles.requestState}>
        <ActivityIndicator color={colors.text} />
        <Text style={styles.requestText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }
  if (status.error) {
    return (
      <Card style={styles.errorCard}>
        <Text style={styles.errorText}>Không thể tải dữ liệu: {status.error}</Text>
        <SecondaryButton label="Thử lại" onPress={onRetry} />
      </Card>
    );
  }
  return null;
}

function listRefresh(
  refreshing: boolean,
  onRefresh: () => void,
): React.ReactElement {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.text}
      colors={[colors.text]}
    />
  );
}

export function OverviewScreen() {
  const navigation = useNavigation<TabsNavigation>();
  const {courses, assignments, profile, status, refresh} = useAppData();
  const openAssignments = assignments.filter(item => !item.completed);
  const upcoming = [...openAssignments]
    .sort((first, second) => first.dueAt.localeCompare(second.dueAt))
    .slice(0, 3);
  const refreshOverview = async () => {
    await Promise.all([
      refresh('courses'),
      refresh('assignments'),
      refresh('profile'),
    ]);
  };
  const waiting =
    status.courses.loading ||
    status.assignments.loading ||
    status.profile.loading;
  const loadError =
    status.courses.error || status.assignments.error || status.profile.error;
  const failedResources = [
    {label: 'môn học', error: status.courses.error},
    {label: 'bài tập', error: status.assignments.error},
    {label: 'hồ sơ', error: status.profile.error},
  ].filter(
    (resource): resource is {label: string; error: string} =>
      resource.error !== null,
  );

  return (
    <Page>
      {waiting && courses.length === 0 && assignments.length === 0 ? (
        <RequestStatus
          status={{loading: true, error: null}}
          onRetry={refreshOverview}
        />
      ) : null}
      {loadError ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>
            Không tải được {failedResources.map(item => item.label).join(', ')}.
          </Text>
          {failedResources.map(item => (
            <Text key={item.label} style={styles.errorDetail}>
              {item.label}: {item.error}
            </Text>
          ))}
          <Text style={styles.errorDetail}>
            API đang được cấu hình là {BASE_URL}. Trên Android Emulator, hãy
            chạy `npm run api` trong terminal của project và xác nhận API mở
            được tại http://localhost:3000/courses trên máy tính.
          </Text>
          <SecondaryButton label="Thử tải lại" onPress={refreshOverview} />
        </Card>
      ) : null}
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>KHÔNG GIAN HỌC TẬP CỦA BẠN</Text>
        <Text style={styles.heroTitle}>
          Xin chào{profile.name ? `, ${profile.name.split(' ')[0]}` : ', bạn'}!
        </Text>
        <Text style={styles.heroSubtitle}>
          Một chút tiến bộ mỗi ngày sẽ tạo nên khác biệt.
        </Text>
        <Text style={styles.profileSummary}>
          {profile.studentId ? `Mã SV ${profile.studentId}` : 'Hồ sơ sinh viên'}
        </Text>
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Môn học" value={String(courses.length)} tint={colors.course} />
        <StatCard label="Chưa xong" value={String(openAssignments.length)} tint={colors.progress} />
        <StatCard
          label="Sắp đến hạn"
          value={String(openAssignments.filter(item => {
            const days = (new Date(item.dueAt).getTime() - Date.now()) / 86_400_000;
            return days >= 0 && days <= 7;
          }).length)}
          tint={colors.surfaceWarm}
        />
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
          onPress={() =>
            navigation.navigate('Courses', {
              screen: 'CourseDetail',
              params: {courseId: course.id},
            })
          }
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
              navigation.navigate('Assignments', {
                screen: 'AssignmentDetail',
                params: {assignmentId: assignment.id},
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
        <Shortcut
          label="Thời khóa biểu"
          symbol="▦"
          onPress={() => navigation.navigate('Schedule')}
        />
        <Shortcut
          label="Hồ sơ"
          symbol="○"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    </Page>
  );
}

function StatCard({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
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
      accessibilityLabel={label}
      onPress={onPress}
      style={({pressed}) => [styles.shortcut, pressed && styles.pressed]}>
      <Text style={styles.shortcutSymbol}>{symbol}</Text>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );
}

export function CoursesScreen() {
  const navigation = useNavigation<CourseNavigation>();
  const {courses, status, refresh, cacheSavedAt} = useAppData();
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
      refreshControl={listRefresh(status.courses.loading, () => refresh('courses'))}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <ScreenTitle
            title="Môn học"
            subtitle={`${courses.length} môn trong học kỳ này`}
          />
          <RequestStatus
            status={status.courses}
            onRetry={() => refresh('courses')}
          />
          <CacheTimestamp savedAt={cacheSavedAt.courses} />
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
        status.courses.loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <EmptyState
            title={status.courses.error ? 'Không có dữ liệu môn học' : 'Không tìm thấy môn học'}
            description={
              status.courses.error
                ? 'Thử tải lại khi máy chủ hoạt động.'
                : 'Thử tìm bằng tên hoặc mã môn khác.'
            }
          />
        )
      }
      ItemSeparatorComponent={ListGap}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function ScheduleScreen() {
  const navigation = useNavigation<ScheduleNavigation>();
  const {schedule, status, refresh, cacheSavedAt} = useAppData();
  const sections = useMemo(
    () =>
      Array.from({length: 7}, (_, index) => {
        const weekday = index + 1;
        const data = schedule
          .filter(session => session.weekday === weekday)
          .sort((first, second) => first.startPeriod - second.startPeriod);
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
      refreshControl={listRefresh(status.schedule.loading, () => refresh('schedule'))}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <ScreenTitle
            title="Thời khóa biểu"
            subtitle={`${schedule.length} buổi học mỗi tuần`}
          />
          <RequestStatus
            status={status.schedule}
            onRetry={() => refresh('schedule')}
          />
          <CacheTimestamp savedAt={cacheSavedAt.schedule} />
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
  const navigation = useNavigation<AssignmentNavigation>();
  const {
    assignments,
    toggleAssignment,
    status,
    refresh,
    cacheSavedAt,
  } = useAppData();
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
        .sort((first, second) => first.dueAt.localeCompare(second.dueAt)),
    [assignments, filter],
  );
  const options = [
    {key: 'all', label: 'Tất cả'},
    {key: 'open', label: 'Cần làm'},
    {key: 'done', label: 'Hoàn thành'},
  ] as const;

  const onToggle = async (id: string) => {
    try {
      await toggleAssignment(id);
    } catch (error) {
      Alert.alert('Không thể cập nhật', getFailureMessage(error));
    }
  };

  return (
    <FlatList
      style={styles.listScreen}
      contentContainerStyle={styles.listContent}
      data={filtered}
      keyExtractor={item => item.id}
      refreshControl={listRefresh(status.assignments.loading, () => refresh('assignments'))}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <ScreenTitle title="Bài tập" subtitle="Theo dõi hạn nộp và tiến độ của bạn." />
          <RequestStatus
            status={status.assignments}
            onRetry={() => refresh('assignments')}
          />
          <CacheTimestamp savedAt={cacheSavedAt.assignments} />
          <PrimaryButton
            label="＋ Tạo bài tập"
            onPress={() => navigation.navigate('CreateAssignment')}
          />
          <View style={styles.filterRow}>
            {options.map(option => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityLabel={`Lọc bài tập: ${option.label}`}
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
          onToggle={() => onToggle(item.id)}
        />
      )}
      ListEmptyComponent={
        status.assignments.loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <EmptyState
            title={
              status.assignments.error
                ? 'Không có dữ liệu bài tập'
                : 'Không có bài tập trong danh sách'
            }
            description={
              status.assignments.error
                ? 'Thử tải lại khi máy chủ hoạt động.'
                : 'Điều chỉnh bộ lọc hoặc tạo bài tập mới.'
            }
          />
        )
      }
      ItemSeparatorComponent={ListGap}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function CreateAssignmentScreen() {
  const navigation = useNavigation<AssignmentNavigation>();
  const {courses, createAssignment, status, refresh, isOnline} = useAppData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [courseId, setCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError('Vui lòng nhập tiêu đề bài tập.');
      return;
    }
    if (!courseId) {
      setError('Vui lòng chọn môn học.');
      return;
    }
    const dueDateIso = parseDueDate(dueDate);
    if (!dueDateIso) {
      setError('Hạn nộp phải là ngày hợp lệ và không ở trong quá khứ.');
      return;
    }

    const payload: AssignmentCreate = {
      courseId: Number(courseId),
      title: normalizedTitle,
      description: description.trim(),
      dueDate: dueDateIso,
      status: 'todo' satisfies AssignmentStatus,
      updatedAt: new Date().toISOString(),
    };
    setSubmitting(true);
    try {
      const result = await createAssignment(payload);
      Alert.alert(
        result === 'queued' ? 'Đã lưu để đồng bộ' : 'Đã tạo bài tập',
        result === 'queued'
          ? 'Bài tập đã được lưu trên thiết bị và sẽ đồng bộ khi có mạng.'
          : 'Bài tập mới đã được lưu trên máy chủ.',
      );
      navigation.goBack();
    } catch (submitError) {
      setError(getFailureMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <ScreenTitle
        title="Tạo bài tập"
        subtitle={
          isOnline
            ? 'Bài tập sẽ được gửi đến máy chủ và hiển thị trong danh sách.'
            : 'Bài tập được lưu trên thiết bị và sẽ gửi khi có mạng.'
        }
      />
      {status.courses.error ? (
        <RequestStatus
          status={status.courses}
          onRetry={() => refresh('courses')}
        />
      ) : null}
      <Card>
        <FormField label="Tiêu đề *">
          <TextInput
            accessibilityLabel="Tiêu đề bài tập"
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Bài tập lập trình"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            maxLength={120}
          />
        </FormField>
        <FormField label="Mô tả">
          <TextInput
            accessibilityLabel="Mô tả bài tập"
            value={description}
            onChangeText={setDescription}
            placeholder="Nội dung cần hoàn thành"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, styles.multilineInput]}
            multiline
            textAlignVertical="top"
          />
        </FormField>
        <FormField label="Hạn nộp * (YYYY-MM-DD)">
          <TextInput
            accessibilityLabel="Hạn nộp theo năm tháng ngày"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="2026-12-31"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
          />
        </FormField>
        <Text style={styles.fieldLabel}>Môn học *</Text>
        {courses.map(course => (
          <Pressable
            key={course.id}
            accessibilityRole="radio"
            accessibilityState={{selected: courseId === course.id}}
            accessibilityLabel={`${course.code} ${course.name}`}
            onPress={() => setCourseId(course.id)}
            style={[
              styles.courseOption,
              courseId === course.id && styles.courseOptionSelected,
            ]}>
            <Text style={styles.bodyText}>
              {course.code} · {course.name}
            </Text>
          </Pressable>
        ))}
        {status.courses.loading ? (
          <ActivityIndicator color={colors.text} />
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton
          label={submitting ? 'Đang gửi...' : 'Tạo bài tập'}
          disabled={submitting || courses.length === 0}
          onPress={submit}
        />
        <SecondaryButton
          label="Hủy"
          onPress={() => navigation.goBack()}
        />
      </Card>
    </Page>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>();
  const {profile, status, refresh, grades, cacheSavedAt} = useAppData();
  const rows = [
    ['Mã sinh viên', profile.studentId],
    ['Lớp', profile.className],
    ['Ngành học', profile.major],
    ['Email', profile.email],
    ['Số điện thoại', profile.phone],
  ];

  return (
    <Page>
      <RequestStatus
        status={status.profile}
        onRetry={() => refresh('profile')}
      />
      <CacheTimestamp savedAt={cacheSavedAt.profile} />
      <ScreenTitle title="Cá nhân" subtitle="Hồ sơ và kết quả học tập." />
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
        <SecondaryButton
          label="Tải lại hồ sơ"
          onPress={() => refresh('profile')}
        />
      </Card>
      <SectionHeading
        title="Kết quả học tập"
        action="Xem tất cả"
        onAction={() => navigation.navigate('Grades')}
      />
      {status.grades.error ? (
        <RequestStatus
          status={status.grades}
          onRetry={() => refresh('grades')}
        />
      ) : grades.length ? (
        grades.slice(0, 2).map(grade => (
          <GradeCard
            key={grade.id}
            grade={grade}
            onPress={() =>
              navigation.navigate('GradeDetail', {gradeId: grade.id})
            }
          />
        ))
      ) : (
        <EmptyState
          title={status.grades.loading ? 'Đang tải kết quả học tập...' : 'Chưa có kết quả học tập'}
          description="Điểm số được tải từ hệ thống học tập."
        />
      )}
    </Page>
  );
}

export function EditProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>();
  const {profile, updateProfile} = useAppData();
  const [form, setForm] = useState(profile);
  const [submitting, setSubmitting] = useState(false);
  const fields: {
    key: keyof Profile;
    label: string;
    keyboard?: 'email-address' | 'phone-pad';
  }[] = [
    {key: 'name', label: 'Họ và tên'},
    {key: 'studentId', label: 'Mã sinh viên'},
    {key: 'className', label: 'Lớp'},
    {key: 'major', label: 'Ngành học'},
    {key: 'email', label: 'Email', keyboard: 'email-address'},
    {key: 'phone', label: 'Số điện thoại', keyboard: 'phone-pad'},
  ];

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const save = async () => {
    if (!form.name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên.');
      return;
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      Alert.alert('Email chưa hợp lệ', 'Vui lòng kiểm tra lại địa chỉ email.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await updateProfile(form);
      Alert.alert(
        result === 'queued' ? 'Đã lưu để đồng bộ' : 'Đã lưu',
        result === 'queued'
          ? 'Thông tin đã được lưu trên thiết bị và sẽ đồng bộ khi có mạng.'
          : 'Thông tin cá nhân đã được cập nhật trên máy chủ.',
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Không thể lưu thông tin', getFailureMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <ScreenTitle
        title="Chỉnh sửa hồ sơ"
        subtitle="Thông tin được cập nhật trên máy chủ."
      />
      <Card>
        {fields.map(field => (
          <FormField key={field.key} label={field.label}>
            <TextInput
              accessibilityLabel={field.label}
              keyboardType={field.keyboard ?? 'default'}
              autoCapitalize={field.key === 'email' ? 'none' : 'words'}
              value={form[field.key]}
              onChangeText={value =>
                setForm(current => ({...current, [field.key]: value}))
              }
              placeholder={`${field.label} (tùy chọn)`}
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </FormField>
        ))}
        <PrimaryButton
          label={submitting ? 'Đang lưu...' : 'Lưu thông tin'}
          disabled={submitting}
          onPress={save}
        />
        <SecondaryButton label="Hủy" onPress={() => navigation.goBack()} />
      </Card>
    </Page>
  );
}

export function CourseDetailScreen() {
  const navigation = useNavigation<CourseNavigation>();
  const route = useRoute();
  const {courses, schedule, assignments, status, refresh} = useAppData();
  const {courseId} = route.params as CoursesStackParamList['CourseDetail'];
  const course = courses.find(item => item.id === courseId);
  const sessions = schedule
    .filter(item => item.courseId === courseId)
    .sort((first, second) => first.weekday - second.weekday || first.startPeriod - second.startPeriod);
  const tasks = assignments.filter(item => item.courseId === courseId);
  const loading = status.courses.loading || status.schedule.loading;

  if (!course && (status.courses.error || status.schedule.error)) {
    return (
      <Page>
        <RequestStatus
          status={status.courses.error ? status.courses : status.schedule}
          onRetry={() => {
            refresh('courses');
            refresh('schedule');
          }}
        />
      </Page>
    );
  }
  if (!course && loading) {
    return <Page><ActivityIndicator color={colors.text} /></Page>;
  }
  if (!course) {
    return <Page><EmptyState title="Không tìm thấy môn học" /></Page>;
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
            onPress={() =>
              navigation.getParent()?.navigate('Schedule', {
                screen: 'ScheduleDetail',
                params: {sessionId: session.id},
              })
            }
          />
        ))
      ) : status.schedule.loading ? (
        <ActivityIndicator color={colors.text} />
      ) : status.schedule.error ? (
        <RequestStatus
          status={status.schedule}
          onRetry={() => refresh('schedule')}
        />
      ) : (
        <EmptyState title="Chưa có lịch học cho môn này" />
      )}
      <SectionHeading title="Bài tập môn học" />
      {tasks.length ? (
        tasks.map(task => (
          <AssignmentCard
            key={task.id}
            assignment={task}
            onPress={() =>
              navigation.getParent()?.navigate('Assignments', {
                screen: 'AssignmentDetail',
                params: {assignmentId: task.id},
              })
            }
          />
        ))
      ) : status.assignments.loading ? (
        <ActivityIndicator color={colors.text} />
      ) : status.assignments.error ? (
        <RequestStatus
          status={status.assignments}
          onRetry={() => refresh('assignments')}
        />
      ) : (
        <EmptyState title="Chưa có bài tập cho môn này" />
      )}
    </Page>
  );
}

export function ScheduleDetailScreen() {
  const route = useRoute();
  const {schedule, courses, status, refresh} = useAppData();
  const {sessionId} = route.params as ScheduleStackParamList['ScheduleDetail'];
  const session = schedule.find(item => item.id === sessionId);
  if (!session && status.schedule.loading) {
    return <Page><ActivityIndicator color={colors.text} /></Page>;
  }
  if (!session) {
    return (
      <Page>
        <RequestStatus
          status={status.schedule}
          onRetry={() => refresh('schedule')}
        />
        {!status.schedule.error ? <EmptyState title="Không tìm thấy buổi học" /> : null}
      </Page>
    );
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
        <InfoRow label="Ngày học" value={weekdayNames[session.weekday % 7]} />
        <InfoRow label="Giờ học" value={`${session.startTime} – ${session.endTime}`} />
        <InfoRow label="Phòng học" value={session.room} />
        <InfoRow label="Giảng viên" value={course?.instructor ?? 'Chưa cập nhật'} />
      </Card>
    </Page>
  );
}

export function AssignmentDetailScreen() {
  const navigation = useNavigation<AssignmentNavigation>();
  const route = useRoute();
  const {assignments, courses, toggleAssignment, status, refresh} = useAppData();
  const {assignmentId} = route.params as AssignmentsStackParamList['AssignmentDetail'];
  const assignment = assignments.find(item => item.id === assignmentId);
  if (!assignment && status.assignments.loading) {
    return <Page><ActivityIndicator color={colors.text} /></Page>;
  }
  if (!assignment) {
    return (
      <Page>
        <RequestStatus
          status={status.assignments}
          onRetry={() => refresh('assignments')}
        />
        {!status.assignments.error ? <EmptyState title="Không tìm thấy bài tập" /> : null}
      </Page>
    );
  }
  const course = courses.find(item => item.id === assignment.courseId);
  const overdue = isOverdue(assignment);
  const toggle = async () => {
    try {
      await toggleAssignment(assignment.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Không thể cập nhật', getFailureMessage(error));
    }
  };
  return (
    <Page>
      <ScreenTitle title={assignment.title} subtitle={course?.name ?? 'Môn học'} />
      <Card>
        <InfoRow label="Mã môn" value={course?.code ?? 'Chưa cập nhật'} />
        <InfoRow label="Hạn nộp" value={`${formatDate(assignment.dueAt)} ${new Date(assignment.dueAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}`} />
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
          onPress={toggle}
        />
      </Card>
    </Page>
  );
}

export function GradesScreen() {
  const navigation = useNavigation<ProfileNavigation>();
  const {grades, courses, status, refresh, cacheSavedAt} = useAppData();
  const actualGrades = grades.map(grade => ({
    ...grade,
    course: courses.find(course => course.id === grade.courseId) ?? {
      id: grade.courseId,
      code: '',
      name: '',
      credits: 0,
      instructor: '',
      room: '',
      description: '',
    },
  }));
  const actualSummary = calculateWeightedGpa(actualGrades);

  return (
    <FlatList
      style={styles.listScreen}
      contentContainerStyle={styles.listContent}
      data={grades}
      keyExtractor={item => item.id}
      refreshControl={listRefresh(status.grades.loading, () => refresh('grades'))}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <ScreenTitle
            title="Điểm số và GPA"
            subtitle={`${actualSummary.earnedCredits} tín chỉ tích lũy · GPA ${actualSummary.gpa.toFixed(2)}`}
          />
          <RequestStatus
            status={status.grades}
            onRetry={() => refresh('grades')}
          />
          <CacheTimestamp savedAt={cacheSavedAt.grades} />
        </View>
      }
      renderItem={({item}) => (
        <GradeCard
          grade={item}
          onPress={() => navigation.navigate('GradeDetail', {gradeId: item.id})}
        />
      )}
      ListEmptyComponent={
        status.grades.loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <EmptyState
            title={status.grades.error ? 'Không thể tải điểm số' : 'Chưa có kết quả học tập'}
            description={status.grades.error ?? 'Kết quả học tập sẽ xuất hiện tại đây.'}
          />
        )
      }
      ItemSeparatorComponent={ListGap}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function GradeDetailScreen() {
  const route = useRoute();
  const {courses, grades, status, refresh} = useAppData();
  const {gradeId} = route.params as ProfileStackParamList['GradeDetail'];
  const grade = grades.find(item => item.id === gradeId);
  if (!grade && status.grades.loading) {
    return <Page><ActivityIndicator color={colors.text} /></Page>;
  }
  if (!grade) {
    return (
      <Page>
        <RequestStatus
          status={status.grades}
          onRetry={() => refresh('grades')}
        />
        {!status.grades.error ? <EmptyState title="Chưa có dữ liệu kết quả" /> : null}
      </Page>
    );
  }
  const course = courses.find(item => item.id === grade.courseId);
  return (
    <Page>
      <ScreenTitle title="Kết quả học tập" subtitle={course?.name ?? 'Môn học'} />
      <Card>
        <InfoRow label="Mã môn" value={course?.code ?? 'Chưa cập nhật'} />
        <InfoRow label="Học kỳ" value={grade.term} />
        <InfoRow label="Tín chỉ" value={String(course?.credits ?? 0)} />
        <InfoRow label="Điểm tổng kết" value={grade.total.toFixed(2)} />
        <InfoRow label="Điểm chữ" value={grade.letter} />
        <InfoRow label="GPA" value={grade.gpa.toFixed(1)} />
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

function FormField({
  label,
  children,
}: React.PropsWithChildren<{label: string}>) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
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

function getFailureMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
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
  multilineInput: {minHeight: 100, paddingTop: spacing.md},
  courseOption: {backgroundColor: colors.surfaceWarm, borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, marginTop: spacing.sm, padding: spacing.md},
  courseOptionSelected: {backgroundColor: colors.course, borderColor: colors.textSecondary},
  courseHero: {borderRadius: radii.lg, gap: spacing.md, padding: spacing.xl},
  descriptionBlock: {gap: spacing.sm, paddingVertical: spacing.md},
  overdueNotice: {backgroundColor: colors.dangerSurface, borderRadius: radii.sm, color: colors.danger, fontSize: typography.body, lineHeight: 22, padding: spacing.md},
  requestState: {alignItems: 'center', gap: spacing.sm, padding: spacing.lg},
  requestText: {color: colors.textSecondary, fontSize: typography.body},
  errorCard: {backgroundColor: colors.dangerSurface},
  errorText: {color: colors.danger, fontSize: typography.body, lineHeight: 22},
  errorDetail: {color: colors.danger, fontSize: typography.caption, lineHeight: 19},
});
