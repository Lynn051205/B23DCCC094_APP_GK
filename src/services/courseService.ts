import {apiClient} from '../api/client';
import type {Course} from '../api/types';

export const courseService = {
  getCourses(): Promise<Course[]> {
    return apiClient.get<Course[]>('/courses');
  },

  getCourseById(id: number): Promise<Course> {
    return apiClient.get<Course>(`/courses/${encodeURIComponent(id)}`);
  },
};
