import React, { useState } from 'react';
import { PlanItem, PlanPriority, PlanStatus } from '../types/plan';
import { 
  Check, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Plus, 
  Copy,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatFriendlyDate, isOverdue, getTodayDateString } from '../utils/dateUtils';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/constants';

interface ListViewProps {
  plans: PlanItem[];
  onUpdatePlan: (plan: PlanItem) => void;
  onDeletePlan: (id: string) => void;
  onDuplicatePlan: (plan: PlanItem) => void;
  onEditPlan: (plan: PlanItem) => void;
  onQuickAdd: (title: string, dueDate: string, priority: PlanPriority) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  plans,
  onUpdatePlan,
  onDeletePlan,
  onDuplicatePlan,
  onEditPlan,
  onQuickAdd,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDueDate, setQuickDueDate] = useState(getTodayDateString());
  const [quickPriority, setQuickPriority] = useState<PlanPriority>('p2');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [expandedSubtaskMap, setExpandedSubtaskMap] = useState<Record<string, boolean>>({});

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAdd(quickTitle.trim(), quickDueDate, quickPriority);
    setQuickTitle('');
  };

  const handleToggleStatus = (plan: PlanItem) => {
    const nextStatus: PlanStatus = plan.status === 'completed' ? 'todo' : 'completed';
    onUpdatePlan({
      ...plan,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStartTitleEdit = (plan: PlanItem) => {
    setEditingTitleId(plan.id);
    setEditingTitleValue(plan.title);
  };

  const handleSaveTitleEdit = (plan: PlanItem) => {
    if (editingTitleValue.trim() && editingTitleValue !== plan.title) {
      onUpdatePlan({
        ...plan,
        title: editingTitleValue.trim(),
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingTitleId(null);
  };

  const handleToggleSubtaskExpand = (planId: string) => {
    setExpandedSubtaskMap((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const handleToggleSubtask = (plan: PlanItem, subtaskId: string) => {
    const updatedSubtasks = plan.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    // If all subtasks completed, option to suggest completed status or keep
    onUpdatePlan({
      ...plan,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCyclePriority = (plan: PlanItem) => {
    const cycle: PlanPriority[] = ['p0', 'p1', 'p2', 'p3'];
    const curIdx = cycle.indexOf(plan.priority);
    const nextPriority = cycle[(curIdx + 1) % cycle.length];
    onUpdatePlan({
      ...plan,
      priority: nextPriority,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCycleStatus = (plan: PlanItem) => {
    const cycle: PlanStatus[] = ['todo', 'in_progress', 'blocked', 'completed'];
    const curIdx = cycle.indexOf(plan.status);
    const nextStatus = cycle[(curIdx + 1) % cycle.length];
    onUpdatePlan({
      ...plan,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickSubmit}
        className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="快速输入新计划，按回车立即添加..."
            className="w-full text-xs text-slate-800 bg-transparent placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Quick Date */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              className="text-xs text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* Quick Priority */}
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as PlanPriority)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-hidden cursor-pointer"
          >
            <option value="p0">P0 紧急</option>
            <option value="p1">P1 高优</option>
            <option value="p2">P2 中等</option>
            <option value="p3">P3 普通</option>
          </select>

          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors whitespace-nowrap"
          >
            添加
          </button>
        </div>
      </form>

      {/* Plan Items List */}
      {plans.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 mb-1">暂无计划项目</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            还没有任何计划。您可以在上方输入框快速输入，或点击右上角「新建计划」开始规划！
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-xs">
          {plans.map((plan) => {
            const overdue = isOverdue(plan.dueDate, plan.status);
            const isCompleted = plan.status === 'completed';
            const subtasksCount = plan.subtasks?.length || 0;
            const completedSubtasksCount =
              plan.subtasks?.filter((s) => s.completed).length || 0;
            const isExpanded = !!expandedSubtaskMap[plan.id];
            const isEditingTitle = editingTitleId === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-3 sm:px-4 sm:py-3 transition-colors hover:bg-slate-50/70 group ${
                  isCompleted ? 'bg-slate-50/40' : ''
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-3">
                  {/* Left: Checkbox + Title + Metadata */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    {/* Status Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(plan)}
                      className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 hover:border-indigo-500 bg-white'
                      }`}
                      title={isCompleted ? '标为未完成' : '标为已完成'}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Expand Subtasks trigger */}
                    {subtasksCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleToggleSubtaskExpand(plan.id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0"
                        title="展开/折叠子任务"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <span className="w-2" />
                    )}

                    {/* Title & Metadata inline */}
                    <div className="flex-1 min-w-0">
                      {isEditingTitle ? (
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          onBlur={() => handleSaveTitleEdit(plan)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitleEdit(plan);
                            if (e.key === 'Escape') setEditingTitleId(null);
                          }}
                          className="w-full text-xs sm:text-sm font-medium text-slate-900 bg-white border border-indigo-400 rounded px-2 py-0.5 focus:outline-hidden"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            onDoubleClick={() => handleStartTitleEdit(plan)}
                            className={`text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none ${
                              isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 hover:text-indigo-600'
                            }`}
                            title="双击直接内联修改标题"
                          >
                            {plan.title}
                          </span>

                          {/* Zero-Pill Unboxed Metadata with · separator */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                            <span>{plan.category}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span
                              className={`tabular-nums ${
                                overdue
                                  ? 'text-rose-600 font-semibold'
                                  : 'text-slate-500'
                              }`}
                            >
                              {formatFriendlyDate(plan.dueDate)}
                            </span>
                            {overdue && (
                              <span className="text-[11px] text-rose-600 font-medium flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" />
                                已逾期
                              </span>
                            )}
                            {subtasksCount > 0 && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="text-[11px] tabular-nums text-slate-500">
                                  子任务 {completedSubtasksCount}/{subtasksCount}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Brief description if any */}
                      {plan.description && !isExpanded && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick In-place Controls (Status tag, Priority tag, Edit, More) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Interactive Status Switcher */}
                    <button
                      type="button"
                      onClick={() => handleCycleStatus(plan)}
                      className={`px-2 py-0.5 text-xs font-medium rounded-md border transition-all ${
                        STATUS_CONFIG[plan.status].bg
                      } ${STATUS_CONFIG[plan.status].text} ${STATUS_CONFIG[plan.status].border}`}
                      title="点击快速流转状态"
                    >
                      {STATUS_CONFIG[plan.status].label}
                    </button>

                    {/* Interactive Priority Switcher */}
                    <button
                      type="button"
                      onClick={() => handleCyclePriority(plan)}
                      className={`px-2 py-0.5 text-xs font-medium rounded-md border transition-all ${
                        PRIORITY_CONFIG[plan.priority].bg
                      } ${PRIORITY_CONFIG[plan.priority].color} ${
                        PRIORITY_CONFIG[plan.priority].border
                      }`}
                      title="点击快速切换优先级"
                    >
                      {PRIORITY_CONFIG[plan.priority].shortLabel}
                    </button>

                    {/* Edit Detail Button */}
                    <button
                      type="button"
                      onClick={() => onEditPlan(plan)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="编辑详情"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate Button */}
                    <button
                      type="button"
                      onClick={() => onDuplicatePlan(plan)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="复制计划"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => onDeletePlan(plan.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="删除计划"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks Checklist */}
                {isExpanded && subtasksCount > 0 && (
                  <div className="mt-3 ml-8 pl-4 border-l-2 border-slate-100 space-y-1.5 py-1">
                    {plan.subtasks.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center gap-2 text-xs text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => handleToggleSubtask(plan, st.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span
                          className={`cursor-pointer ${
                            st.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                          onClick={() => handleToggleSubtask(plan, st.id)}
                        >
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
