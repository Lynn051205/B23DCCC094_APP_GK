import {
  isValidCalendarDate,
  validateBookingForm,
  validateFieldForm,
  validatePhone,
} from '../src/utils/validation';
import {seedFields} from '../src/storage/storage';

describe('validatePhone', () => {
  it('chỉ nhận 10 chữ số bắt đầu bằng 0', () => {
    expect(validatePhone('0901234567')).toBeUndefined();
    expect(validatePhone('9012345678')).toBeDefined();
    expect(validatePhone('090123456')).toBeDefined();
  });
});

describe('isValidCalendarDate', () => {
  it('nhận ngày hợp lệ và từ chối ngày không tồn tại', () => {
    expect(isValidCalendarDate('28/10/2026')).toBe(true);
    expect(isValidCalendarDate('31/02/2026')).toBe(false);
    expect(isValidCalendarDate('2026-10-28')).toBe(false);
  });
});

describe('validateFieldForm', () => {
  it('không cho trùng tên không phân biệt hoa thường', () => {
    const errors = validateFieldForm(
      {
        name: ' sân a1 ',
        type: '5 người',
        pricePerHour: '300000',
        status: 'Hoạt động',
      },
      seedFields,
    );
    expect(errors.name).toBe('Tên sân đã tồn tại.');
  });

  it('từ chối giá không hợp lệ', () => {
    const errors = validateFieldForm(
      {
        name: 'Sân mới',
        type: '5 người',
        pricePerHour: 'abc',
        status: 'Hoạt động',
      },
      seedFields,
    );
    expect(errors.pricePerHour).toBeDefined();
  });
});

describe('validateBookingForm', () => {
  it('từ chối giờ kết thúc vượt 23h', () => {
    const errors = validateBookingForm({
      customerName: 'An',
      phone: '0901234567',
      date: '28/10/2026',
      startHour: 22,
      hours: 2,
    });
    expect(errors.hours).toBe('Giờ kết thúc phải không vượt quá 23h.');
  });

  it('cho phép 21h thuê 2 giờ', () => {
    const errors = validateBookingForm({
      customerName: 'An',
      phone: '0901234567',
      date: '28/10/2026',
      startHour: 21,
      hours: 2,
    });
    expect(errors).toEqual({});
  });
});
