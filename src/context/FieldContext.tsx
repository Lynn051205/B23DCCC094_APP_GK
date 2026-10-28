import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Alert} from 'react-native';
import type {Booking, FootballField} from '../types';
import {
  loadBookings,
  loadFields,
  saveBookings,
  saveFields,
} from '../storage/storage';
import {createId} from '../utils/formatters';
import {isBookingConflict} from '../utils/bookingUtils';
import {normalizeName} from '../utils/validation';

type FieldContextValue = {
  loading: boolean;
  fields: FootballField[];
  bookings: Booking[];
  addField: (
    input: Omit<FootballField, 'id'>,
  ) => Promise<boolean>;
  updateField: (
    fieldId: string,
    input: Omit<FootballField, 'id'>,
  ) => Promise<boolean>;
  deleteField: (fieldId: string) => Promise<boolean>;
  addBooking: (
    input: Omit<Booking, 'id'>,
  ) => Promise<{ok: boolean; message?: string}>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export function FieldProvider({children}: {children: React.ReactNode}) {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FootballField[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const fieldsRef = useRef(fields);
  const bookingsRef = useRef(bookings);
  const savingRef = useRef(false);

  fieldsRef.current = fields;
  bookingsRef.current = bookings;

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [nextFields, nextBookings] = await Promise.all([
          loadFields(),
          loadBookings(),
        ]);
        if (active) {
          setFields(nextFields);
          setBookings(nextBookings);
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            'Không thể tải dữ liệu',
            error instanceof Error
              ? error.message
              : 'Đã xảy ra lỗi khi đọc dữ liệu đã lưu.',
          );
          setFields([]);
          setBookings([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrap().catch(() => {
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const persistFields = useCallback(async (next: FootballField[]) => {
    savingRef.current = true;
    try {
      await saveFields(next);
      setFields(next);
      fieldsRef.current = next;
      return true;
    } catch (error) {
      Alert.alert(
        'Không thể lưu sân',
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu dữ liệu sân.',
      );
      return false;
    } finally {
      savingRef.current = false;
    }
  }, []);

  const persistBookings = useCallback(async (next: Booking[]) => {
    savingRef.current = true;
    try {
      await saveBookings(next);
      setBookings(next);
      bookingsRef.current = next;
      return true;
    } catch (error) {
      Alert.alert(
        'Không thể lưu lịch đặt',
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi lưu dữ liệu đặt sân.',
      );
      return false;
    } finally {
      savingRef.current = false;
    }
  }, []);

  const addField = useCallback(
    async (input: Omit<FootballField, 'id'>) => {
      if (savingRef.current) {
        return false;
      }
      const next: FootballField[] = [
        ...fieldsRef.current,
        {
          ...input,
          id: createId('field'),
          name: normalizeName(input.name),
        },
      ];
      return persistFields(next);
    },
    [persistFields],
  );

  const updateField = useCallback(
    async (fieldId: string, input: Omit<FootballField, 'id'>) => {
      if (savingRef.current) {
        return false;
      }
      const next = fieldsRef.current.map(field =>
        field.id === fieldId
          ? {...field, ...input, name: normalizeName(input.name)}
          : field,
      );
      return persistFields(next);
    },
    [persistFields],
  );

  const deleteField = useCallback(
    async (fieldId: string) => {
      if (savingRef.current) {
        return false;
      }
      const next = fieldsRef.current.filter(field => field.id !== fieldId);
      return persistFields(next);
    },
    [persistFields],
  );

  const addBooking = useCallback(
    async (input: Omit<Booking, 'id'>) => {
      if (savingRef.current) {
        return {ok: false, message: 'Hệ thống đang lưu dữ liệu, vui lòng thử lại.'};
      }

      const field = fieldsRef.current.find(item => item.id === input.fieldId);
      if (!field) {
        return {ok: false, message: 'Sân không còn tồn tại.'};
      }
      if (field.status === 'Bảo trì') {
        return {ok: false, message: 'Sân đang bảo trì, không thể đặt sân.'};
      }
      if (isBookingConflict(input, bookingsRef.current)) {
        return {
          ok: false,
          message: 'Khung giờ này đã được đặt. Vui lòng chọn giờ khác.',
        };
      }

      const next: Booking[] = [
        ...bookingsRef.current,
        {
          ...input,
          id: createId('booking'),
          customerName: normalizeName(input.customerName),
          phone: input.phone.trim(),
          date: input.date.trim(),
        },
      ];
      const saved = await persistBookings(next);
      return saved
        ? {ok: true}
        : {ok: false, message: 'Không thể lưu lượt đặt sân.'};
    },
    [persistBookings],
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      if (savingRef.current) {
        return false;
      }
      const next = bookingsRef.current.filter(item => item.id !== bookingId);
      return persistBookings(next);
    },
    [persistBookings],
  );

  const value = useMemo(
    () => ({
      loading,
      fields,
      bookings,
      addField,
      updateField,
      deleteField,
      addBooking,
      cancelBooking,
    }),
    [
      loading,
      fields,
      bookings,
      addField,
      updateField,
      deleteField,
      addBooking,
      cancelBooking,
    ],
  );

  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>;
}

export function useFields(): FieldContextValue {
  const value = useContext(FieldContext);
  if (!value) {
    throw new Error('useFields must be used inside FieldProvider');
  }
  return value;
}
