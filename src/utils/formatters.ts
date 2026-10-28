export function formatCurrency(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 đ';
  }
  const parts = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${parts} đ`;
}

export function formatPricePerHour(value: number): string {
  return `${formatCurrency(value)}/giờ`;
}

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function formatTimeRange(startHour: number, hours: number): string {
  return `${formatHour(startHour)} – ${formatHour(startHour + hours)}`;
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
