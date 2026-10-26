import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {PropsWithChildren} from 'react';
import type {
  Assignment,
  ClassSession,
  Course,
  Grade,
  Profile,
} from '../data/learningData';
import {emptyProfile} from '../data/learningData';
import type {
  AssignmentCreate,
  AssignmentWithCourse,
  Student,
} from '../api/types';
import {assignmentService} from '../services/assignmentService';
import {courseService} from '../services/courseService';
import {gradeService} from '../services/gradeService';
import {sessionService} from '../services/sessionService';
import {studentService} from '../services/studentService';
import {calculateTotal, getLetterGrade} from '../utils/grades';
import {readCache, writeCache} from '../storage/cache';
import {outbox} from '../storage/outbox';
import {useNetworkStatus} from '../hooks/useNetworkStatus';
import {useSyncQueue} from '../hooks/useSyncQueue';
import type {SyncResult} from '../services/syncService';

export type DataKey =
  | 'courses'
  | 'schedule'
  | 'assignments'
  | 'grades'
  | 'profile';

export type DataStatus = {
  loading: boolean;
  error: string | null;
};

export type MutationResult = 'synced' | 'queued';

type AppData = {
  courses: Course[];
  schedule: ClassSession[];
  assignments: Assignment[];
  grades: Grade[];
  profile: Profile;
  status: Record<DataKey, DataStatus>;
  cacheSavedAt: Record<DataKey, string | null>;
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  syncMessage: string | null;
  syncError: string | null;
  refresh: (key: DataKey) => Promise<void>;
  refreshAll: () => Promise<void>;
  synchronize: () => Promise<SyncResult>;
  updateProfile: (profile: Profile) => Promise<MutationResult>;
  toggleAssignment: (id: string) => Promise<MutationResult>;
  createAssignment: (assignment: AssignmentCreate) => Promise<MutationResult>;
};

const resourceKeys: DataKey[] = [
  'courses',
  'schedule',
  'assignments',
  'grades',
  'profile',
];

const initialStatus: Record<DataKey, DataStatus> = {
  courses: {loading: true, error: null},
  schedule: {loading: true, error: null},
  assignments: {loading: true, error: null},
  grades: {loading: true, error: null},
  profile: {loading: true, error: null},
};

const initialCacheTimes: Record<DataKey, string | null> = {
  courses: null,
  schedule: null,
  assignments: null,
  grades: null,
  profile: null,
};

export const AppDataContext = createContext<AppData | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isProfile(value: unknown): value is Profile {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.studentId === 'string' &&
    typeof value.className === 'string' &&
    typeof value.major === 'string' &&
    typeof value.email === 'string' &&
    typeof value.phone === 'string'
  );
}

function isCourseArray(value: unknown): value is Course[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        isRecord(item) &&
        isString(item.id) &&
        isString(item.code) &&
        isString(item.name) &&
        typeof item.credits === 'number',
    )
  );
}

function isScheduleArray(value: unknown): value is ClassSession[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        isRecord(item) &&
        isString(item.id) &&
        isString(item.courseId) &&
        typeof item.weekday === 'number' &&
        typeof item.startPeriod === 'number' &&
        typeof item.endPeriod === 'number' &&
        isString(item.startTime) &&
        isString(item.endTime) &&
        isString(item.room),
    )
  );
}

function isAssignmentArray(value: unknown): value is Assignment[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        isRecord(item) &&
        isString(item.id) &&
        isString(item.courseId) &&
        isString(item.title) &&
        isString(item.dueAt) &&
        isString(item.description) &&
        typeof item.completed === 'boolean',
    )
  );
}

function isGradeArray(value: unknown): value is Grade[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        isRecord(item) &&
        isString(item.id) &&
        isString(item.courseId) &&
        isString(item.term) &&
        typeof item.total === 'number' &&
        typeof item.attendance === 'number' &&
        typeof item.midterm === 'number' &&
        typeof item.final === 'number' &&
        isString(item.letter) &&
        typeof item.gpa === 'number',
    )
  );
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Đã xảy ra lỗi khi tải dữ liệu.';
}

function isNetworkFailure(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error.type === 'network' || error.type === 'timeout')
  );
}

function mapStudent(student: Student): Profile {
  return {
    name: student.name,
    studentId: student.studentCode,
    className: student.className,
    major: student.major,
    email: student.email,
    phone: student.phone,
  };
}

function mapAssignment(item: AssignmentWithCourse): Assignment {
  return {
    id: String(item.id),
    courseId: String(item.courseId),
    title: item.title,
    dueAt: item.dueDate,
    description: item.description,
    completed: item.status === 'done',
    clientRequestId: item.clientRequestId,
  };
}

function newRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AppDataProvider({children}: PropsWithChildren) {
  const {isOnline} = useNetworkStatus();
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [status, setStatus] = useState(initialStatus);
  const [cacheSavedAt, setCacheSavedAt] = useState(initialCacheTimes);
  const [localSyncMessage, setLocalSyncMessage] = useState<string | null>(null);
  const hydrated = useRef(new Set<DataKey>());
  const hasUsableData = useRef(new Set<DataKey>());
  const pendingAssignmentUpdates = useRef(new Set<string>());

  const setResourceStatus = useCallback(
    (key: DataKey, next: DataStatus) => {
      setStatus(current => ({...current, [key]: next}));
    },
    [],
  );

  const applyCachedData = useCallback(
    (key: DataKey, data: unknown) => {
      switch (key) {
        case 'courses':
          if (isCourseArray(data)) {
            setCourses(data);
          }
          break;
        case 'schedule':
          if (isScheduleArray(data)) {
            setSchedule(data);
          }
          break;
        case 'assignments':
          if (isAssignmentArray(data)) {
            setAssignments(data);
          }
          break;
        case 'grades':
          if (isGradeArray(data)) {
            setGrades(data);
          }
          break;
        case 'profile':
          if (isProfile(data)) {
            setProfile(data);
          }
          break;
      }
    },
    [],
  );

  const refresh = useCallback(
    async (key: DataKey) => {
      let foundData = hasUsableData.current.has(key);
      let cacheReadError: string | null = null;
      setResourceStatus(key, {
        loading: true,
        error: null,
      });

      if (!hydrated.current.has(key)) {
        try {
          const cached = await readCache(key, getCacheValidator(key));
          if (cached) {
            hydrated.current.add(key);
            hasUsableData.current.add(key);
            foundData = true;
            applyCachedData(key, cached.data);
            setCacheSavedAt(current => ({...current, [key]: cached.savedAt}));
          }
        } catch (error) {
          cacheReadError = getErrorMessage(error);
        } finally {
          hydrated.current.add(key);
        }
      }

      if (!isOnline) {
        if (!foundData) {
          setResourceStatus(key, {
            loading: false,
            error: cacheReadError
              ? `Không thể đọc cache: ${cacheReadError}`
              : 'Thiết bị đang offline và chưa có dữ liệu đã lưu.',
          });
        } else {
          setResourceStatus(key, {loading: false, error: null});
        }
        return;
      }

      try {
        const data = await fetchResource(key);
        applyCachedData(key, data);
        hydrated.current.add(key);
        hasUsableData.current.add(key);
        try {
          const savedAt = await writeCache(key, data);
          setCacheSavedAt(current => ({...current, [key]: savedAt}));
          setResourceStatus(key, {loading: false, error: null});
        } catch (cacheError) {
          setResourceStatus(key, {
            loading: false,
            error: `Dữ liệu đã tải nhưng không thể lưu cache: ${getErrorMessage(cacheError)}`,
          });
        }
      } catch (error) {
        setResourceStatus(key, {
          loading: false,
          error: hasUsableData.current.has(key)
            ? null
            : cacheReadError
              ? `Không tải được dữ liệu (${getErrorMessage(error)}); đồng thời không đọc được cache (${cacheReadError}).`
              : getErrorMessage(error),
        });
      }
    },
    [applyCachedData, isOnline, setResourceStatus],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all(resourceKeys.map(key => refresh(key)));
  }, [refresh]);

  const syncQueue = useSyncQueue({isOnline, onSynced: refreshAll});

  useEffect(() => {
    if (!syncQueue.queueReady) {
      return;
    }
    if (isOnline && syncQueue.pendingCount > 0) {
      return;
    }
    refreshAll();
  }, [
    isOnline,
    refreshAll,
    syncQueue.pendingCount,
    syncQueue.queueReady,
  ]);

  const persistCurrent = useCallback(
    async (key: DataKey, data: unknown) => {
      try {
        const savedAt = await writeCache(key, data);
        hydrated.current.add(key);
        hasUsableData.current.add(key);
        setCacheSavedAt(current => ({...current, [key]: savedAt}));
        setResourceStatus(key, {loading: false, error: null});
      } catch (error) {
        setResourceStatus(key, {
          loading: false,
          error: `Không thể lưu cache: ${getErrorMessage(error)}`,
        });
      }
    },
    [setResourceStatus],
  );

  const updateProfile = useCallback(
    async (updatedProfile: Profile): Promise<MutationResult> => {
      const previous = profile;
      const optimistic = {
        ...updatedProfile,
        name: updatedProfile.name.trim(),
        studentId: updatedProfile.studentId.trim(),
        className: updatedProfile.className.trim(),
        major: updatedProfile.major.trim(),
        email: updatedProfile.email.trim(),
        phone: updatedProfile.phone.trim(),
      };
      const createdAt = new Date().toISOString();
      const body = {
        name: optimistic.name,
        studentCode: optimistic.studentId,
        className: optimistic.className,
        major: optimistic.major,
        email: optimistic.email,
        phone: optimistic.phone,
        updatedAt: createdAt,
      };

      setProfile(optimistic);
      await persistCurrent('profile', optimistic);
      if (!isOnline) {
        try {
          await syncQueue.enqueue('PATCH', '/students/1', body, createdAt);
          return 'queued';
        } catch (error) {
          setProfile(previous);
          await persistCurrent('profile', previous);
          throw error;
        }
      }
      try {
        const saved = await studentService.updateStudent(body);
        const mapped = mapStudent(saved);
        setProfile(mapped);
        await persistCurrent('profile', mapped);
        return 'synced';
      } catch (error) {
        if (isNetworkFailure(error)) {
          try {
            await syncQueue.enqueue('PATCH', '/students/1', body, createdAt);
            return 'queued';
          } catch (queueError) {
            setProfile(previous);
            await persistCurrent('profile', previous);
            throw queueError;
          }
        }
        setProfile(previous);
        await persistCurrent('profile', previous);
        throw error;
      }
    },
    [isOnline, persistCurrent, profile, syncQueue],
  );

  const toggleAssignment = useCallback(
    async (id: string): Promise<MutationResult> => {
      if (pendingAssignmentUpdates.current.has(id)) {
        return 'synced';
      }
      const previous = assignments.find(item => item.id === id);
      if (!previous) {
        return 'synced';
      }
      const completed = !previous.completed;
      const updatedAt = new Date().toISOString();
      const optimistic = assignments.map(item =>
        item.id === id ? {...item, completed} : item,
      );
      setAssignments(optimistic);
      await persistCurrent('assignments', optimistic);

      if (id.startsWith('local:') && previous.clientRequestId) {
        const updated = await outbox.updateQueuedAssignment(
          previous.clientRequestId,
          {
            status: completed ? 'done' : 'todo',
            updatedAt,
          },
        );
        if (!updated) {
          setAssignments(assignments);
          await persistCurrent('assignments', assignments);
          throw new Error('Không tìm thấy bài tập offline trong hàng đợi.');
        }
        return 'queued';
      }

      const body: {status: 'done' | 'todo'; updatedAt: string} = {
        status: completed ? 'done' : 'todo',
        updatedAt,
      };
      if (!isOnline) {
        try {
          await syncQueue.enqueue(
            'PATCH',
            `/assignments/${encodeURIComponent(id)}`,
            body,
            updatedAt,
          );
          return 'queued';
        } catch (error) {
          setAssignments(assignments);
          await persistCurrent('assignments', assignments);
          throw error;
        }
      }

      pendingAssignmentUpdates.current.add(id);
      try {
        await assignmentService.updateAssignment(Number(id), body);
        return 'synced';
      } catch (error) {
        if (isNetworkFailure(error)) {
          try {
            await syncQueue.enqueue(
              'PATCH',
              `/assignments/${encodeURIComponent(id)}`,
              body,
              updatedAt,
            );
            return 'queued';
          } catch (queueError) {
            setAssignments(current =>
              current.map(item => (item.id === id ? previous : item)),
            );
            await persistCurrent(
              'assignments',
              assignments.map(item => (item.id === id ? previous : item)),
            );
            throw queueError;
          }
        }
        setAssignments(current =>
          current.map(item => (item.id === id ? previous : item)),
        );
        await persistCurrent(
          'assignments',
          assignments.map(item => (item.id === id ? previous : item)),
        );
        throw error;
      } finally {
        pendingAssignmentUpdates.current.delete(id);
      }
    },
    [assignments, isOnline, persistCurrent, syncQueue],
  );

  const createAssignment = useCallback(
    async (assignment: AssignmentCreate): Promise<MutationResult> => {
      const clientRequestId = assignment.clientRequestId ?? newRequestId();
      const payload: AssignmentCreate = {
        ...assignment,
        clientRequestId,
        updatedAt: assignment.updatedAt || new Date().toISOString(),
      };
      const addLocal = async () => {
        const local: Assignment = {
          id: `local:${clientRequestId}`,
          courseId: String(payload.courseId),
          title: payload.title,
          dueAt: payload.dueDate,
          description: payload.description,
          completed: payload.status === 'done',
          clientRequestId,
        };
        const next = [...assignments, local].sort((first, second) =>
          first.dueAt.localeCompare(second.dueAt),
        );
        setAssignments(next);
        await persistCurrent('assignments', next);
      };

      if (!isOnline) {
        await syncQueue.enqueue('POST', '/assignments', payload);
        await addLocal();
        return 'queued';
      }
      try {
        const created = await assignmentService.createAssignment(payload);
        const newItem: Assignment = {
          id: String(created.id),
          courseId: String(created.courseId),
          title: created.title,
          dueAt: created.dueDate,
          description: created.description,
          completed: created.status === 'done',
          clientRequestId: created.clientRequestId,
        };
        const next = [...assignments, newItem].sort((first, second) =>
          first.dueAt.localeCompare(second.dueAt),
        );
        setAssignments(next);
        await persistCurrent('assignments', next);
        return 'synced';
      } catch (error) {
        if (isNetworkFailure(error)) {
          await syncQueue.enqueue('POST', '/assignments', payload);
          await addLocal();
          return 'queued';
        }
        throw error;
      }
    },
    [assignments, isOnline, persistCurrent, syncQueue],
  );

  const value = useMemo(
    () => ({
      courses,
      schedule,
      assignments,
      grades,
      profile,
      status,
      cacheSavedAt,
      isOnline: syncQueue.isOnline,
      pendingCount: syncQueue.pendingCount,
      syncing: syncQueue.syncing,
      syncMessage: syncQueue.syncMessage ?? localSyncMessage,
      syncError: syncQueue.syncError,
      refresh,
      refreshAll,
      synchronize: syncQueue.sync,
      updateProfile,
      toggleAssignment,
      createAssignment,
    }),
    [
      assignments,
      cacheSavedAt,
      courses,
      createAssignment,
      grades,
      localSyncMessage,
      profile,
      refresh,
      refreshAll,
      schedule,
      status,
      syncQueue,
      toggleAssignment,
      updateProfile,
    ],
  );

  useEffect(() => {
    if (syncQueue.syncMessage) {
      setLocalSyncMessage(syncQueue.syncMessage);
    }
  }, [syncQueue.syncMessage]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

function getCacheValidator(key: DataKey): (value: unknown) => value is unknown {
  switch (key) {
    case 'courses':
      return isCourseArray;
    case 'schedule':
      return isScheduleArray;
    case 'assignments':
      return isAssignmentArray;
    case 'grades':
      return isGradeArray;
    case 'profile':
      return isProfile;
  }
}

async function fetchResource(key: DataKey): Promise<unknown> {
  switch (key) {
    case 'courses':
      return (await courseService.getCourses()).map(item => ({
        ...item,
        id: String(item.id),
      }));
    case 'schedule':
      return (await sessionService.getSessions()).map(item => ({
        id: String(item.id),
        courseId: String(item.courseId),
        weekday: item.dayOfWeek - 1,
        startPeriod: item.startPeriod,
        endPeriod: item.endPeriod,
        startTime: item.startTime.slice(11, 16),
        endTime: item.endTime.slice(11, 16),
        room: item.room,
      }));
    case 'assignments':
      return (await assignmentService.getAssignments()).map(mapAssignment);
    case 'grades':
      return (await gradeService.getGrades()).map(item => {
        const total = calculateTotal(
          item.attendance,
          item.midterm,
          item.final,
        );
        const converted = getLetterGrade(total);
        return {
          id: String(item.id),
          courseId: String(item.courseId),
          term: item.term,
          attendance: item.attendance,
          midterm: item.midterm,
          final: item.final,
          total,
          letter: converted.letter,
          gpa: converted.gpa,
          components: [
            {label: 'Chuyên cần (10%)', score: item.attendance},
            {label: 'Giữa kỳ (30%)', score: item.midterm},
            {label: 'Cuối kỳ (60%)', score: item.final},
          ],
        };
      });
    case 'profile':
      return mapStudent(await studentService.getStudent());
  }
}

export function useAppData(): AppData {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return value;
}
