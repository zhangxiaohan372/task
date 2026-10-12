/**
 * Date helper utilities for calendar & plan scheduling
 */

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateString(now);
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateString(d);
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  const todayStr = getTodayDateString();
  
  if (dateStr === todayStr) {
    return '今天';
  }
  const tomorrowStr = addDays(todayStr, 1);
  if (dateStr === tomorrowStr) {
    return '明天';
  }
  const yesterdayStr = addDays(todayStr, -1);
  if (dateStr === yesterdayStr) {
    return '昨天';
  }

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDay = weekDays[d.getDay()];

  return `${month}月${day}日 (${weekDay})`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'completed' || !dueDate) return false;
  const today = getTodayDateString();
  return dueDate < today;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

/**
 * Month grid calculations:
 * Returns 35 or 42 calendar cell items for the given year and month (0-indexed month)
 */
export interface CalendarCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export function getMonthCalendarCells(year: number, month: number): CalendarCell[] {
  // First day of month
  const firstDayOfMonth = new Date(year, month, 1);
  // Day of week: 0 (Sun) to 6 (Sat). We'll use Monday as start of week (0 = Monday, 6 = Sunday)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday is 6th index

  // Last day of month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Previous month days needed
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];
  const todayStr = getTodayDateString();

  // 1. Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, day);
    const dateStr = formatDateString(prevDate);
    const dayOfWeek = prevDate.getDay();
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const curDate = new Date(year, month, day);
    const dateStr = formatDateString(curDate);
    const dayOfWeek = curDate.getDay();
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // 3. Next month leading days to complete full weeks (up to multiple of 7, min 35, max 42)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateStr = formatDateString(nextDate);
      const dayOfWeek = nextDate.getDay();
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
  }

  return cells;
}

/**
 * Returns 7 days for a week view centered on or starting with reference date
 */
export function getWeekDays(referenceDateStr: string): CalendarCell[] {
  const ref = parseDateString(referenceDateStr);
  let dayOfWeek = ref.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6; // Monday = 0

  const monday = new Date(ref);
  monday.setDate(ref.getDate() - dayOfWeek);

  const todayStr = getTodayDateString();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDateString(d);
    const dow = d.getDay();
    cells.push({
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dow === 0 || dow === 6,
    });
  }

  return cells;
}
