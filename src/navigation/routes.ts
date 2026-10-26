import type {NavigatorScreenParams} from '@react-navigation/native';

export type OverviewStackParamList = {
  Overview: undefined;
};

export type CoursesStackParamList = {
  Courses: undefined;
  CourseDetail: {courseId: string};
};

export type ScheduleStackParamList = {
  Schedule: undefined;
  ScheduleDetail: {sessionId: string};
};

export type AssignmentsStackParamList = {
  Assignments: undefined;
  AssignmentDetail: {assignmentId: string};
  CreateAssignment: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Grades: undefined;
  GradeDetail: {gradeId: string};
};

export type RootTabParamList = {
  Overview: NavigatorScreenParams<OverviewStackParamList> | undefined;
  Courses: NavigatorScreenParams<CoursesStackParamList> | undefined;
  Schedule: NavigatorScreenParams<ScheduleStackParamList> | undefined;
  Assignments: NavigatorScreenParams<AssignmentsStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
