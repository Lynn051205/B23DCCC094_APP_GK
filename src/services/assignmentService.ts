import {apiClient} from '../api/client';
import type {
  Assignment,
  AssignmentCreate,
  AssignmentUpdate,
  AssignmentWithCourse,
} from '../api/types';

export const assignmentService = {
  getAssignments(): Promise<AssignmentWithCourse[]> {
    return apiClient.get<AssignmentWithCourse[]>(
      '/assignments?_expand=course&_sort=dueDate',
    );
  },

  updateAssignment(
    id: number,
    changes: AssignmentUpdate,
  ): Promise<Assignment> {
    return apiClient.patch<Assignment, AssignmentUpdate>(
      `/assignments/${encodeURIComponent(id)}`,
      changes,
    );
  },

  createAssignment(assignment: AssignmentCreate): Promise<Assignment> {
    return apiClient.post<Assignment, AssignmentCreate>(
      '/assignments',
      assignment,
    );
  },
};
