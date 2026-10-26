import {apiClient} from '../api/client';
import type {GradeWithCourse} from '../api/types';

export const gradeService = {
  getGrades(): Promise<GradeWithCourse[]> {
    return apiClient.get<GradeWithCourse[]>('/grades?_expand=course');
  },
};
