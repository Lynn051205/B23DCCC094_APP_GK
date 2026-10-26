import {
  calculateTotal,
  calculateWeightedGpa,
  getLetterGrade,
} from '../src/utils/grades';

describe('grade calculations', () => {
  test('uses the required component weights', () => {
    expect(calculateTotal(8, 7, 8.5)).toBe(8);
  });

  test.each([
    [8.5, 'A', 4],
    [8, 'B+', 3.5],
    [7, 'B', 3],
    [6.5, 'C+', 2.5],
    [5.5, 'C', 2],
    [5, 'D+', 1.5],
    [4, 'D', 1],
    [3.99, 'F', 0],
  ])('converts total %s to %s / %s', (total, letter, gpa) => {
    expect(getLetterGrade(total)).toEqual({letter, gpa});
  });

  test('weights GPA by all graded credits but excludes failed credits from earned credits', () => {
    const result = calculateWeightedGpa([
      {
        attendance: 10,
        midterm: 10,
        final: 10,
        course: {credits: 3},
      },
      {
        attendance: 0,
        midterm: 0,
        final: 0,
        course: {credits: 4},
      },
      {
        attendance: 8,
        midterm: 7,
        final: 8.5,
        course: {credits: 1},
      },
    ]);

    expect(result).toEqual({gpa: 1.94, earnedCredits: 4});
  });
});
