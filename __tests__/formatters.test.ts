import {
  formatCurrency,
  formatHour,
  formatPricePerHour,
  formatTimeRange,
} from '../src/utils/formatters';

describe('formatters', () => {
  it('định dạng tiền tệ và giá thuê theo chuẩn yêu cầu đề bài (300.000 đ/giờ)', () => {
    expect(formatCurrency(300000)).toBe('300.000 đ');
    expect(formatPricePerHour(300000)).toBe('300.000 đ/giờ');
    expect(formatPricePerHour(450000)).toBe('450.000 đ/giờ');
  });

  it('định dạng giờ và khoảng thời gian đặt sân chính xác', () => {
    expect(formatHour(6)).toBe('06:00');
    expect(formatHour(17)).toBe('17:00');
    expect(formatTimeRange(17, 2)).toBe('17:00 – 19:00');
    expect(formatTimeRange(19, 1)).toBe('19:00 – 20:00');
  });
});

