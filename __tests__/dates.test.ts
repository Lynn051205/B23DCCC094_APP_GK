import {parseDueDate} from '../src/utils/dates';

describe('assignment due date validation', () => {
  const now = new Date(2026, 10, 2, 12, 0);

  test('accepts a valid non-past date and returns an ISO timestamp', () => {
    expect(parseDueDate('2026-11-03', now)).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test.each(['2026-02-30', '2026-13-01', '03/11/2026', '2026-11-01'])(
    'rejects invalid or past date %s',
    value => {
      expect(parseDueDate(value, now)).toBeNull();
    },
  );
});
