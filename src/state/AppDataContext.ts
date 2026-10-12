import {createContext, useContext} from 'react';
import type {Assignment, ClassSession, Course, Profile} from '../data/learningData';

type AppData = {
  courses: Course[];
  schedule: ClassSession[];
  assignments: Assignment[];
  profile: Profile;
  updateProfile: (profile: Profile) => void;
  toggleAssignment: (id: string) => void;
};

export const AppDataContext = createContext<AppData | null>(null);

export function useAppData(): AppData {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData must be used inside AppDataContext.Provider');
  }
  return value;
}
