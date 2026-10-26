import {apiClient} from '../api/client';
import type {Student, StudentUpdate} from '../api/types';

const STUDENT_ID = 1;

export const studentService = {
  getStudent(): Promise<Student> {
    return apiClient.get<Student>(`/students/${STUDENT_ID}`);
  },

  updateStudent(changes: StudentUpdate): Promise<Student> {
    return apiClient.patch<Student, StudentUpdate>(
      `/students/${STUDENT_ID}`,
      changes,
    );
  },
};
