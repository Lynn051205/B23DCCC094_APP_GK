export type Student = {
  id: number;
  studentCode: string;
  name: string;
  className: string;
  major: string;
  email: string;
  phone: string;
  updatedAt: string;
};

export type StudentUpdate = Partial<Omit<Student, 'id'>>;

export type Course = {
  id: number;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  room: string;
  description: string;
};

export type ClassSession = {
  id: number;
  courseId: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  startTime: string;
  endTime: string;
  room: string;
};

export type SessionWithCourse = ClassSession & {course: Course};

export type AssignmentStatus = 'todo' | 'done';

export type Assignment = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  updatedAt: string;
  clientRequestId?: string;
};

export type AssignmentWithCourse = Assignment & {course: Course};
export type AssignmentCreate = Omit<Assignment, 'id'>;
export type AssignmentUpdate = Partial<Omit<Assignment, 'id'>>;

export type Grade = {
  id: number;
  courseId: number;
  term: string;
  attendance: number;
  midterm: number;
  final: number;
  total: number;
};

export type GradeWithCourse = Grade & {course: Course};

export type ApiErrorType = 'network' | 'timeout' | 'http';

export type ApiError = {
  type: ApiErrorType;
  status: number | null;
  message: string;
};
