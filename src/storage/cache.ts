import AsyncStorage from '@react-native-async-storage/async-storage';

export type CachedValue<T> = {
  data: T;
  savedAt: string;
};

const CACHE_PREFIX = 'study-planner:cache:v1:';

export async function readCache<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): Promise<CachedValue<T> | null> {
  const serialized = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (serialized === null) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('data' in parsed) ||
    !('savedAt' in parsed) ||
    typeof parsed.savedAt !== 'string' ||
    Number.isNaN(Date.parse(parsed.savedAt)) ||
    !isValid(parsed.data)
  ) {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }

  return {data: parsed.data, savedAt: parsed.savedAt};
}

export async function writeCache<T>(key: string, data: T): Promise<string> {
  const savedAt = new Date().toISOString();
  const value: CachedValue<T> = {data, savedAt};
  await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  return savedAt;
}
