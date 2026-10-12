export type PlanStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

export type PlanPriority = 'p0' | 'p1' | 'p2' | 'p3';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface PlanItem {
  id: string;
  title: string;
  description?: string;
  status: PlanStatus;
  priority: PlanPriority;
  category: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  color: string;     // color key e.g. 'indigo', 'emerald', 'amber', 'rose', 'sky', 'purple'
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'list' | 'calendar' | 'kanban';

export type CalendarSpanMode = 'month' | 'week';

export interface PlanFilterState {
  search: string;
  status: 'all' | PlanStatus;
  priority: 'all' | PlanPriority;
  category: 'all' | string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
