export type LetterGrade = {
  letter: string;
  gpa: number;
};

export type GradeForCalculation = {
  attendance: number;
  midterm: number;
  final: number;
  course: {credits: number};
};

export function calculateTotal(
  attendance: number,
  midterm: number,
  final: number,
): number {
  return attendance * 0.1 + midterm * 0.3 + final * 0.6;
}

export function getLetterGrade(total: number): LetterGrade {
  if (total >= 8.5) {
    return {letter: 'A', gpa: 4};
  }
  if (total >= 8) {
    return {letter: 'B+', gpa: 3.5};
  }
  if (total >= 7) {
    return {letter: 'B', gpa: 3};
  }
  if (total >= 6.5) {
    return {letter: 'C+', gpa: 2.5};
  }
  if (total >= 5.5) {
    return {letter: 'C', gpa: 2};
  }
  if (total >= 5) {
    return {letter: 'D+', gpa: 1.5};
  }
  if (total >= 4) {
    return {letter: 'D', gpa: 1};
  }
  return {letter: 'F', gpa: 0};
}

export function calculateWeightedGpa(grades: GradeForCalculation[]): {
  gpa: number;
  earnedCredits: number;
} {
  const passingGrades = grades.filter(
    grade => getLetterGrade(calculateTotal(grade.attendance, grade.midterm, grade.final)).letter !== 'F',
  );
  const earnedCredits = passingGrades.reduce(
    (sum, grade) => sum + grade.course.credits,
    0,
  );
  const gradedCredits = grades.reduce(
    (sum, grade) => sum + grade.course.credits,
    0,
  );
  if (gradedCredits === 0) {
    return {gpa: 0, earnedCredits};
  }
  const weightedPoints = grades.reduce((sum, grade) => {
    const total = calculateTotal(grade.attendance, grade.midterm, grade.final);
    return sum + getLetterGrade(total).gpa * grade.course.credits;
  }, 0);
  return {
    gpa: Number((weightedPoints / gradedCredits).toFixed(2)),
    earnedCredits,
  };
}
