export type RootStackParamList = {
  MainTabs: undefined;
  CourseDetail: {courseId: string};
  ScheduleDetail: {sessionId: string};
  AssignmentDetail: {assignmentId: string};
  GradeDetail: {gradeId: string};
  EditProfile: undefined;
};

export type RootTabParamList = {
  Overview: undefined;
  Courses: undefined;
  Schedule: undefined;
  Assignments: undefined;
  Profile: undefined;
};
