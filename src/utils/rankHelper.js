export function getRank(gpa) {
  const score = Number(gpa);
  if (score >= 8.5) return 'Giỏi';
  if (score >= 7) return 'Khá';
  if (score >= 5) return 'Trung bình';
  return 'Yếu';
}
