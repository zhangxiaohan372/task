import React, { useState } from 'react';
import { PlanItem, PlanStatus } from '../types/plan';
import { 
  getMonthCalendarCells, 
  getWeekDays, 
  formatDateString, 
  getTodayDateString, 
  formatFriendlyDate, 
  isOverdue 
} from '../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, COLOR_PALETTE } from '../utils/constants';

interface CalendarViewProps {
  plans: PlanItem[];
  onUpdatePlan: (plan: PlanItem) => void;
  onEditPlan: (plan: PlanItem) => void;
  onCreatePlanForDate: (dateStr: string) => void;
  onDeletePlan: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  plans,
  onUpdatePlan,
  onEditPlan,
  onCreatePlanForDate,
  onDeletePlan,
}) => {
  const todayStr = getTodayDateString();
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [viewSpan, setViewSpan] = useState<'month' | 'week'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [draggedPlanId, setDraggedPlanId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const weekDayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const handlePrevMonth = () => {
    if (viewSpan === 'week') {
      const d = new Date(selectedDateStr);
      d.setDate(d.getDate() - 7);
      setSelectedDateStr(formatDateString(d));
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    } else {
      if (currentMonth === 0) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(11);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (viewSpan === 'week') {
      const d = new Date(selectedDateStr);
      d.setDate(d.getDate() + 7);
      setSelectedDateStr(formatDateString(d));
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    } else {
      if (currentMonth === 11) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(0);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Drag and drop reschedule handlers
  const handleDragStart = (e: React.DragEvent, planId: string) => {
    e.dataTransfer.setData('text/plain', planId);
    setDraggedPlanId(planId);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const planId = e.dataTransfer.getData('text/plain') || draggedPlanId;
    if (!planId) return;

    const planToMove = plans.find((p) => p.id === planId);
    if (planToMove && planToMove.dueDate !== targetDateStr) {
      onUpdatePlan({
        ...planToMove,
        dueDate: targetDateStr,
        startDate: planToMove.startDate > targetDateStr ? targetDateStr : planToMove.startDate,
        updatedAt: new Date().toISOString(),
      });
    }
    setDraggedPlanId(null);
  };

  const handleTogglePlanStatus = (e: React.MouseEvent, plan: PlanItem) => {
    e.stopPropagation();
    const nextStatus: PlanStatus = plan.status === 'completed' ? 'todo' : 'completed';
    onUpdatePlan({
      ...plan,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Get cells
  const calendarCells =
    viewSpan === 'month'
      ? getMonthCalendarCells(currentYear, currentMonth)
      : getWeekDays(selectedDateStr);

  // Group plans by date: plans where dueDate === dateStr or startDate === dateStr
  const getPlansForDate = (dateStr: string) => {
    return plans.filter((p) => p.dueDate === dateStr || (p.startDate === dateStr && p.dueDate !== dateStr));
  };

  const selectedDatePlans = getPlansForDate(selectedDateStr);

  return (
    <div className="space-y-4">
      {/* Calendar Controls & Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
              title="上一月/周"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
            >
              今日
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
              title="下一月/周"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 tabular-nums ml-2">
            {currentYear}年 {monthNames[currentMonth]}
          </h2>
        </div>

        {/* View toggle (Month / Week) & Drag hint */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-slate-400">
            提示: 可拖拽计划卡片直接调整截止日期，点击卡片即时编辑
          </span>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewSpan('month')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewSpan === 'month'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              月历视图
            </button>
            <button
              onClick={() => setViewSpan('week')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewSpan === 'week'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              周视图
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center text-xs font-semibold text-slate-600 py-2.5">
          {weekDayLabels.map((label, idx) => (
            <div
              key={label}
              className={idx >= 5 ? 'text-rose-500 font-medium' : 'text-slate-700'}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/50">
          {calendarCells.map((cell) => {
            const dayPlans = getPlansForDate(cell.dateStr);
            const isSelected = selectedDateStr === cell.dateStr;
            const isDragTarget = dragOverDate === cell.dateStr;

            return (
              <div
                key={cell.dateStr}
                onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cell.dateStr)}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 bg-white flex flex-col transition-all cursor-pointer group relative ${
                  !cell.isCurrentMonth ? 'bg-slate-50/40 text-slate-400' : 'text-slate-800'
                } ${cell.isToday ? 'bg-blue-50/20' : ''} ${
                  isSelected ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''
                } ${isDragTarget ? 'bg-indigo-50/80 ring-2 ring-indigo-400' : ''}`}
              >
                {/* Cell Header: Day Number & Add Button */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-semibold tabular-nums w-6 h-6 rounded-full ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : cell.isWeekend
                        ? 'text-rose-500'
                        : 'text-slate-700'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Quick Add Plan for this date button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreatePlanForDate(cell.dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-all"
                    title={`在 ${cell.dateStr} 新建计划`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plans List in this day */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5">
                  {dayPlans.map((plan) => {
                    const isCompleted = plan.status === 'completed';
                    const overdue = isOverdue(plan.dueDate, plan.status);
                    const colorData = COLOR_PALETTE[plan.color] || COLOR_PALETTE.indigo;

                    return (
                      <div
                        key={plan.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, plan.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPlan(plan);
                        }}
                        className={`text-[11px] p-1 rounded-md border flex items-center justify-between gap-1 transition-all shadow-2xs hover:shadow-xs group/item cursor-grab active:cursor-grabbing ${
                          isCompleted
                            ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                            : `${colorData.bg} ${colorData.border} ${colorData.text}`
                        }`}
                        title={`${plan.title} (优先级: ${PRIORITY_CONFIG[plan.priority].label}, 截止: ${plan.dueDate}) - 点击编辑，拖拽改期`}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          {/* Mini Status toggle button */}
                          <button
                            type="button"
                            onClick={(e) => handleTogglePlanStatus(e, plan)}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white hover:border-indigo-500'
                            }`}
                          >
                            {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </button>

                          {/* Plan Title */}
                          <span className="truncate font-medium flex-1">
                            {plan.title}
                          </span>
                        </div>

                        {/* Priority / Warning glyph */}
                        {overdue && (
                          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Drawer / Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {formatFriendlyDate(selectedDateStr)} 的计划安排
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({selectedDateStr})
            </span>
            <span className="text-xs text-slate-500 ml-2">
              共 {selectedDatePlans.length} 项
            </span>
          </div>

          <button
            onClick={() => onCreatePlanForDate(selectedDateStr)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加本日计划</span>
          </button>
        </div>

        {selectedDatePlans.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            该日期暂未排定计划，点击右上角「添加本日计划」开始安排。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {selectedDatePlans.map((plan) => {
              const isCompleted = plan.status === 'completed';
              return (
                <div
                  key={plan.id}
                  onClick={() => onEditPlan(plan)}
                  className="p-3 border border-slate-200 hover:border-indigo-300 rounded-lg bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {plan.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          STATUS_CONFIG[plan.status].bg
                        } ${STATUS_CONFIG[plan.status].text}`}
                      >
                        {STATUS_CONFIG[plan.status].label}
                      </span>
                    </div>

                    {plan.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {plan.category} · {PRIORITY_CONFIG[plan.priority].shortLabel}
                    </span>
                    <span className="text-indigo-600 font-medium group-hover:underline">
                      点击编辑详情 →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
