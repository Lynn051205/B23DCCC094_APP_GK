import AsyncStorage from '@react-native-async-storage/async-storage';
import {readCache, writeCache} from '../src/storage/cache';

const getItem = jest.mocked(AsyncStorage.getItem);
const setItem = jest.mocked(AsyncStorage.setItem);
const removeItem = jest.mocked(AsyncStorage.removeItem);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

describe('AsyncStorage cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('stores data with savedAt and reads it back', async () => {
    const stored = new Map<string, string>();
    setItem.mockImplementation(async (key, value) => {
      stored.set(key, value);
    });
    getItem.mockImplementation(async key => stored.get(key) ?? null);

    const savedAt = await writeCache('courses', ['IT3040']);

    expect(await readCache('courses', isStringArray)).toEqual({
      data: ['IT3040'],
      savedAt,
    });
    expect(setItem).toHaveBeenCalledWith(
      'study-planner:cache:v1:courses',
      expect.stringContaining('"savedAt"'),
    );
  });

  test('removes malformed and shape-invalid cache values safely', async () => {
    getItem.mockResolvedValueOnce('{');
    expect(await readCache('courses', isStringArray)).toBeNull();
    expect(removeItem).toHaveBeenCalledWith('study-planner:cache:v1:courses');

    getItem.mockResolvedValueOnce(
      JSON.stringify({data: {not: 'an array'}, savedAt: new Date().toISOString()}),
    );
    expect(await readCache('courses', isStringArray)).toBeNull();
    expect(removeItem).toHaveBeenCalledTimes(2);
  });
});
