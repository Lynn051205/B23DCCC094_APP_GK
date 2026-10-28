import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Booking, FootballField} from '../types';

const FIELDS_KEY = '@football_fields';
const BOOKINGS_KEY = '@football_bookings';

export const seedFields: FootballField[] = [
  {
    id: 'field-a1',
    name: 'Sân A1',
    type: '5 người',
    pricePerHour: 300000,
    status: 'Hoạt động',
  },
  {
    id: 'field-a2',
    name: 'Sân A2',
    type: '5 người',
    pricePerHour: 320000,
    status: 'Hoạt động',
  },
  {
    id: 'field-b1',
    name: 'Sân B1',
    type: '7 người',
    pricePerHour: 450000,
    status: 'Hoạt động',
  },
  {
    id: 'field-c1',
    name: 'Sân C1',
    type: '7 người',
    pricePerHour: 480000,
    status: 'Bảo trì',
  },
];

export const seedBookings: Booking[] = [
  {
    id: 'booking-1',
    fieldId: 'field-a1',
    customerName: 'Nguyễn Văn An',
    phone: '0901234567',
    date: '28/10/2026',
    startHour: 17,
    hours: 2,
  },
  {
    id: 'booking-2',
    fieldId: 'field-a1',
    customerName: 'Trần Minh Khoa',
    phone: '0912345678',
    date: '28/10/2026',
    startHour: 19,
    hours: 2,
  },
  {
    id: 'booking-3',
    fieldId: 'field-b1',
    customerName: 'Lê Thị Hoa',
    phone: '0987654321',
    date: '29/10/2026',
    startHour: 18,
    hours: 1,
  },
];

function isFootballField(value: unknown): value is FootballField {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    (item.type === '5 người' || item.type === '7 người') &&
    typeof item.pricePerHour === 'number' &&
    Number.isFinite(item.pricePerHour) &&
    (item.status === 'Hoạt động' || item.status === 'Bảo trì')
  );
}

function isBooking(value: unknown): value is Booking {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.fieldId === 'string' &&
    typeof item.customerName === 'string' &&
    typeof item.phone === 'string' &&
    typeof item.date === 'string' &&
    typeof item.startHour === 'number' &&
    Number.isInteger(item.startHour) &&
    typeof item.hours === 'number' &&
    Number.isInteger(item.hours)
  );
}

async function readList<T>(
  key: string,
  guard: (value: unknown) => value is T,
): Promise<{exists: boolean; data: T[] | null}> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) {
    return {exists: false, data: null};
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(guard)) {
    throw new Error('Dữ liệu lưu trữ không hợp lệ.');
  }
  return {exists: true, data: parsed};
}

let fieldsWriteChain: Promise<void> = Promise.resolve();
let bookingsWriteChain: Promise<void> = Promise.resolve();

function enqueueWrite(
  getChain: () => Promise<void>,
  setChain: (next: Promise<void>) => void,
  task: () => Promise<void>,
): Promise<void> {
  const job = getChain().then(task, task);
  setChain(job.catch(() => undefined));
  return job;
}

export async function loadFields(): Promise<FootballField[]> {
  const result = await readList(FIELDS_KEY, isFootballField);
  if (!result.exists) {
    await saveFields(seedFields);
    return seedFields;
  }
  return result.data ?? [];
}

export async function saveFields(fields: FootballField[]): Promise<void> {
  const snapshot = fields;
  return enqueueWrite(
    () => fieldsWriteChain,
    next => {
      fieldsWriteChain = next;
    },
    async () => {
      await AsyncStorage.setItem(FIELDS_KEY, JSON.stringify(snapshot));
    },
  );
}

export async function loadBookings(): Promise<Booking[]> {
  const result = await readList(BOOKINGS_KEY, isBooking);
  if (!result.exists) {
    await saveBookings(seedBookings);
    return seedBookings;
  }
  return result.data ?? [];
}

export async function saveBookings(bookings: Booking[]): Promise<void> {
  const snapshot = bookings;
  return enqueueWrite(
    () => bookingsWriteChain,
    next => {
      bookingsWriteChain = next;
    },
    async () => {
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(snapshot));
    },
  );
}
