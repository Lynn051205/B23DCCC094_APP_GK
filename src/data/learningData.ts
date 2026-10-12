export type Course = {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  room: string;
  description: string;
};

export type ClassSession = {
  id: string;
  courseId: string;
  weekday: number;
  startPeriod: number;
  endPeriod: number;
  startTime: string;
  endTime: string;
  room: string;
};

export type Assignment = {
  id: string;
  courseId: string;
  title: string;
  dueAt: string;
  description: string;
  completed: boolean;
};

import {colors} from '../theme';

export type Grade = {
  id: string;
  courseId: string;
  term: string;
  total: number;
  components?: {label: string; score: number}[];
};

export type Profile = {
  name: string;
  studentId: string;
  className: string;
  major: string;
  email: string;
  phone: string;
};

export const emptyProfile: Profile = {
  name: '',
  studentId: '',
  className: '',
  major: '',
  email: '',
  phone: '',
};

export const demoCourses: Course[] = [
  {
    id: 'course-mobile',
    code: 'IT3040',
    name: 'Lập trình ứng dụng di động',
    credits: 3,
    instructor: 'Nguyễn Minh Hà',
    room: 'A205',
    description: 'Nguyên lý thiết kế và phát triển ứng dụng di động đa nền tảng.',
  },
  {
    id: 'course-database',
    code: 'IT3020',
    name: 'Cơ sở dữ liệu',
    credits: 3,
    instructor: 'Trần Quốc Bảo',
    room: 'B104',
    description: 'Mô hình dữ liệu quan hệ, truy vấn SQL và thiết kế cơ sở dữ liệu.',
  },
  {
    id: 'course-web',
    code: 'IT3030',
    name: 'Phát triển ứng dụng web',
    credits: 3,
    instructor: 'Lê Thu Trang',
    room: 'A302',
    description: 'Các nền tảng và kỹ thuật xây dựng ứng dụng web hiện đại.',
  },
  {
    id: 'course-algorithms',
    code: 'IT2010',
    name: 'Cấu trúc dữ liệu và giải thuật',
    credits: 4,
    instructor: 'Phạm Anh Tuấn',
    room: 'C202',
    description: 'Cấu trúc dữ liệu cơ bản và phân tích độ phức tạp thuật toán.',
  },
  {
    id: 'course-english',
    code: 'ENG201',
    name: 'Tiếng Anh chuyên ngành',
    credits: 2,
    instructor: 'Đang cập nhật',
    room: 'D101',
    description: 'Từ vựng và kỹ năng giao tiếp tiếng Anh trong lĩnh vực công nghệ.',
  },
];

export const demoSchedule: ClassSession[] = [
  {id: 'session-1', courseId: 'course-mobile', weekday: 1, startPeriod: 1, endPeriod: 3, startTime: '07:00', endTime: '09:30', room: 'A205'},
  {id: 'session-2', courseId: 'course-database', weekday: 2, startPeriod: 4, endPeriod: 6, startTime: '09:40', endTime: '12:10', room: 'B104'},
  {id: 'session-3', courseId: 'course-web', weekday: 3, startPeriod: 1, endPeriod: 3, startTime: '07:00', endTime: '09:30', room: 'A302'},
  {id: 'session-4', courseId: 'course-algorithms', weekday: 4, startPeriod: 7, endPeriod: 9, startTime: '13:00', endTime: '15:30', room: 'C202'},
  {id: 'session-5', courseId: 'course-english', weekday: 5, startPeriod: 4, endPeriod: 5, startTime: '09:40', endTime: '11:20', room: 'D101'},
  {id: 'session-6', courseId: 'course-mobile', weekday: 6, startPeriod: 1, endPeriod: 3, startTime: '07:00', endTime: '09:30', room: 'A205'},
];

function dateAfterDays(days: number): string {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  dueDate.setHours(23, 59, 0, 0);
  return dueDate.toISOString();
}

export const demoAssignments: Assignment[] = [
  {
    id: 'assignment-mobile',
    courseId: 'course-mobile',
    title: 'Ứng dụng ghi chú cá nhân',
    dueAt: dateAfterDays(2),
    description: 'Hoàn thiện giao diện danh sách ghi chú và luồng tạo ghi chú mới.',
    completed: false,
  },
  {
    id: 'assignment-database',
    courseId: 'course-database',
    title: 'Thiết kế cơ sở dữ liệu thư viện',
    dueAt: dateAfterDays(5),
    description: 'Vẽ sơ đồ ERD và chuyển đổi sang mô hình quan hệ.',
    completed: false,
  },
  {
    id: 'assignment-web',
    courseId: 'course-web',
    title: 'Trang giới thiệu sản phẩm',
    dueAt: dateAfterDays(8),
    description: 'Xây dựng trang giới thiệu responsive theo yêu cầu môn học.',
    completed: true,
  },
];

export const grades: Grade[] = [];

export const coursePalette = [
  colors.course,
  colors.navigation,
  colors.progress,
  colors.schedule,
  colors.positive,
] as const;

export function colorForCourse(courseId: string): string {
  const hash = Array.from(courseId).reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
  return coursePalette[hash % coursePalette.length];
}

export const weekdayNames = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];
