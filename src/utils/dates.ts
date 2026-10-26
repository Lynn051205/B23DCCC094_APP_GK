export function parseDueDate(value: string, now = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const dueDate = new Date(`${value}T23:59:00`);
  const [year, month, day] = value.split('-').map(Number);
  if (
    Number.isNaN(dueDate.getTime()) ||
    dueDate.getFullYear() !== year ||
    dueDate.getMonth() !== month - 1 ||
    dueDate.getDate() !== day ||
    dueDate.getTime() < now.getTime()
  ) {
    return null;
  }
  return dueDate.toISOString();
}
