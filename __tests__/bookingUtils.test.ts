import {
  hasTimeOverlap,
  isBookingConflict,
} from '../src/utils/bookingUtils';
import type {Booking} from '../src/types';

const existing: Booking[] = [
  {
    id: 'b1',
    fieldId: 'field-a1',
    customerName: 'An',
    phone: '0901234567',
    date: '28/10/2026',
    startHour: 17,
    hours: 2,
  },
];

describe('hasTimeOverlap', () => {
  it('từ chối khi khung giờ giao nhau', () => {
    expect(hasTimeOverlap(18, 2, 17, 2)).toBe(true);
    expect(hasTimeOverlap(17, 1, 17, 2)).toBe(true);
  });

  it('cho phép hai lượt đặt nối tiếp', () => {
    expect(hasTimeOverlap(19, 1, 17, 2)).toBe(false);
  });
});

describe('isBookingConflict', () => {
  it('từ chối trùng sân, ngày và giờ', () => {
    expect(
      isBookingConflict(
        {fieldId: 'field-a1', date: '28/10/2026', startHour: 18, hours: 2},
        existing,
      ),
    ).toBe(true);
  });

  it('cho phép cùng giờ khác sân', () => {
    expect(
      isBookingConflict(
        {fieldId: 'field-b1', date: '28/10/2026', startHour: 17, hours: 2},
        existing,
      ),
    ).toBe(false);
  });

  it('cho phép cùng sân khác ngày', () => {
    expect(
      isBookingConflict(
        {fieldId: 'field-a1', date: '29/10/2026', startHour: 17, hours: 2},
        existing,
      ),
    ).toBe(false);
  });
});
