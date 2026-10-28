import type {BookingFormValues, FieldFormValues, FootballField} from '../types';
import {getEndHour} from './bookingUtils';

export type FieldErrors = Partial<Record<keyof FieldFormValues, string>>;
export type BookingErrors = Partial<Record<keyof BookingFormValues, string>>;

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return false;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateFieldForm(
  values: FieldFormValues,
  fields: FootballField[],
  currentFieldId?: string,
): FieldErrors {
  const errors: FieldErrors = {};
  const name = normalizeName(values.name);

  if (!name) {
    errors.name = 'Tên sân không được để trống.';
  } else {
    const duplicated = fields.some(
      field =>
        field.id !== currentFieldId &&
        normalizeName(field.name).toLowerCase() === name.toLowerCase(),
    );
    if (duplicated) {
      errors.name = 'Tên sân đã tồn tại.';
    }
  }

  const price = Number(values.pricePerHour.trim().replace(',', '.'));
  if (values.pricePerHour.trim() === '') {
    errors.pricePerHour = 'Giá thuê không được để trống.';
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.pricePerHour = 'Giá thuê phải là số hữu hạn lớn hơn 0.';
  }

  return errors;
}

export function validateCustomerName(value: string): string | undefined {
  if (!normalizeName(value)) {
    return 'Tên khách hàng không được để trống.';
  }
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (!/^0\d{9}$/.test(value.trim())) {
    return 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.';
  }
  return undefined;
}

export function validateDate(value: string): string | undefined {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
    return 'Ngày đặt phải theo định dạng dd/mm/yyyy.';
  }
  if (!isValidCalendarDate(value.trim())) {
    return 'Ngày đặt không hợp lệ.';
  }
  return undefined;
}

export function validateStartHour(value: number): string | undefined {
  if (!Number.isInteger(value) || value < 6 || value > 22) {
    return 'Giờ bắt đầu phải từ 6h đến 22h.';
  }
  return undefined;
}

export function validateHours(value: number): string | undefined {
  if (!Number.isInteger(value) || value < 1 || value > 3) {
    return 'Số giờ thuê phải từ 1 đến 3 giờ.';
  }
  return undefined;
}

export function validateBookingForm(values: BookingFormValues): BookingErrors {
  const errors: BookingErrors = {};
  const nameError = validateCustomerName(values.customerName);
  const phoneError = validatePhone(values.phone);
  const dateError = validateDate(values.date);
  const startHourError = validateStartHour(values.startHour);
  const hoursError = validateHours(values.hours);

  if (nameError) {
    errors.customerName = nameError;
  }
  if (phoneError) {
    errors.phone = phoneError;
  }
  if (dateError) {
    errors.date = dateError;
  }
  if (startHourError) {
    errors.startHour = startHourError;
  }
  if (hoursError) {
    errors.hours = hoursError;
  }

  if (!startHourError && !hoursError) {
    const endHour = getEndHour(values.startHour, values.hours);
    if (endHour > 23) {
      errors.hours = 'Giờ kết thúc phải không vượt quá 23h.';
    }
  }

  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
