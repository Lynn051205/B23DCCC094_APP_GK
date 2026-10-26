import {apiClient} from '../api/client';
import type {SessionWithCourse} from '../api/types';

export const sessionService = {
  getSessions(): Promise<SessionWithCourse[]> {
    return apiClient.get<SessionWithCourse[]>('/sessions?_expand=course');
  },
};
