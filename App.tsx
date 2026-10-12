import React, {useEffect, useMemo, useState} from 'react';
import {Alert, StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {
  demoAssignments,
  demoCourses,
  demoSchedule,
  emptyProfile,
} from './src/data/learningData';
import type {Assignment, Profile} from './src/data/learningData';
import {AppDataContext} from './src/state/AppDataContext';

const STORAGE_KEY = 'study-planner:data:v1';

function isProfile(value: unknown): value is Profile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return Object.keys(emptyProfile).every(
    key => typeof (value as Record<string, unknown>)[key] === 'string',
  );
}

function isSavedAssignment(
  value: unknown,
  id: string,
): value is Pick<Assignment, 'id' | 'completed'> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return (
    'id' in value &&
    'completed' in value &&
    typeof value.id === 'string' &&
    value.id === id &&
    typeof value.completed === 'boolean'
  );
}

function App() {
  const [assignments, setAssignments] = useState(demoAssignments);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (typeof parsed === 'object' && parsed !== null) {
            const data = parsed as Record<string, unknown>;
            const savedProfile = data.profile;
            const savedAssignments = data.assignments;
            if (active) {
              if (isProfile(savedProfile)) {
                setProfile(savedProfile);
              }
              if (Array.isArray(savedAssignments)) {
                setAssignments(current =>
                  current.map(item => {
                    const savedItem = savedAssignments.find(
                      candidate => isSavedAssignment(candidate, item.id),
                    );
                    return savedItem
                      ? {...item, completed: savedItem.completed}
                      : item;
                  }),
                );
              }
            }
          }
        }
      } catch (error) {
        Alert.alert(
          'Không thể tải dữ liệu',
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đọc dữ liệu.',
        );
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    restore().catch(error => {
      if (active) {
        Alert.alert(
          'Không thể tải dữ liệu',
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đọc dữ liệu.',
        );
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({profile, assignments})).catch(
      error => {
        Alert.alert(
          'Không thể lưu dữ liệu',
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu dữ liệu.',
        );
      },
    );
  }, [assignments, profile, ready]);

  const contextValue = useMemo(
    () => ({
      courses: demoCourses,
      schedule: demoSchedule,
      assignments,
      profile,
      updateProfile: setProfile,
      toggleAssignment: (id: string) =>
        setAssignments(current =>
          current.map(item =>
            item.id === id ? {...item, completed: !item.completed} : item,
          ),
        ),
    }),
    [assignments, profile],
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppDataContext.Provider value={contextValue}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppDataContext.Provider>
    </SafeAreaProvider>
  );
}

export default App;
