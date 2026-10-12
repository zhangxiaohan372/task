import React from 'react';
import { PlanItem, PlanStatus } from '../types/plan';
import { getTodayDateString, isOverdue } from '../utils/dateUtils';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CalendarDays,
  Target
} from 'lucide-react';

interface PlanStatsProps {
  plans: PlanItem[];
  onSelectStatusFilter?: (status: 'all' | PlanStatus) => void;
  currentStatusFilter?: string;
}

export const PlanStats: React.FC<PlanStatsProps> = ({
  plans,
  onSelectStatusFilter,
  currentStatusFilter,
}) => {
  const total = plans.length;
  const completed = plans.filter((p) => p.status === 'completed').length;
  const inProgress = plans.filter((p) => p.status === 'in_progress').length;
  const todo = plans.filter((p) => p.status === 'todo').length;
  
  const todayStr = getTodayDateString();
  const dueTodayOrOverdue = plans.filter(
    (p) => p.status !== 'completed' && (p.dueDate === todayStr || isOverdue(p.dueDate, p.status))
  ).length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {/* Metric 1: Total Plans */}
      <div 
        onClick={() => onSelectStatusFilter?.('all')}
        className={`bg-white border rounded-xl p-3.5 transition-all cursor-pointer hover:border-slate-300 ${
          currentStatusFilter === 'all' ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">全部计划</span>
          <Target className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {total}
          </span>
          <span className="text-xs text-slate-400">个任务项</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>待办 {todo}</span>
          <span>·</span>
          <span>进行中 {inProgress}</span>
        </div>
      </div>

      {/* Metric 2: In Progress */}
      <div 
        onClick={() => onSelectStatusFilter?.('in_progress')}
        className={`bg-white border rounded-xl p-3.5 transition-all cursor-pointer hover:border-blue-300 ${
          currentStatusFilter === 'in_progress' ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
          <span className="font-medium">正在推进</span>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-blue-900 tabular-nums">
            {inProgress}
          </span>
          <span className="text-xs text-blue-600/80">进行中</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          专注当前关键事项
        </div>
      </div>

      {/* Metric 3: Today / Overdue */}
      <div 
        className="bg-white border border-slate-200 rounded-xl p-3.5 transition-all"
      >
        <div className="flex items-center justify-between text-xs text-amber-600 mb-1">
          <span className="font-medium">今日/临近截止</span>
          {dueTodayOrOverdue > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          ) : (
            <CalendarDays className="w-4 h-4 text-slate-400" />
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight tabular-nums ${
            dueTodayOrOverdue > 0 ? 'text-amber-700' : 'text-slate-900'
          }`}>
            {dueTodayOrOverdue}
          </span>
          <span className="text-xs text-slate-400">项需关注</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {dueTodayOrOverdue > 0 ? '优先安排今日时间' : '当前无紧急逾期任务'}
        </div>
      </div>

      {/* Metric 4: Completed & Progress Bar */}
      <div 
        onClick={() => onSelectStatusFilter?.('completed')}
        className={`bg-white border rounded-xl p-3.5 transition-all cursor-pointer hover:border-emerald-300 ${
          currentStatusFilter === 'completed' ? 'border-emerald-400 ring-2 ring-emerald-50' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-emerald-600 mb-1">
          <span className="font-medium">已完成达成率</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-800 tabular-nums">
            {completionPercentage}%
          </span>
          <span className="text-xs text-slate-500 tabular-nums">
            ({completed}/{total})
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
