import React, { useState } from 'react';
import { PlanItem, PlanPriority, PlanStatus } from '../types/plan';
import { 
  Plus, 
  Check, 
  Calendar, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  ListTodo,
  Tag
} from 'lucide-react';
import { formatFriendlyDate, isOverdue, getTodayDateString } from '../utils/dateUtils';
import { STATUS_CONFIG, PRIORITY_CONFIG, COLOR_PALETTE } from '../utils/constants';

interface KanbanViewProps {
  plans: PlanItem[];
  onUpdatePlan: (plan: PlanItem) => void;
  onEditPlan: (plan: PlanItem) => void;
  onDeletePlan: (id: string) => void;
  onCreatePlanForStatus: (status: PlanStatus) => void;
}

const COLUMNS: { id: PlanStatus; title: string; subtitle: string }[] = [
  { id: 'todo', title: '待办计划', subtitle: '准备开始的任务' },
  { id: 'in_progress', title: '进行中', subtitle: '当前专注推进中' },
  { id: 'blocked', title: '受阻/等待', subtitle: '依赖外部或暂停' },
  { id: 'completed', title: '已完成', subtitle: '成果归档与达成' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  plans,
  onUpdatePlan,
  onEditPlan,
  onDeletePlan,
  onCreatePlanForStatus,
}) => {
  const [draggedPlanId, setDraggedPlanId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PlanStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, planId: string) => {
    e.dataTransfer.setData('text/plain', planId);
    setDraggedPlanId(planId);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: PlanStatus) => {
    e.preventDefault();
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: PlanStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const planId = e.dataTransfer.getData('text/plain') || draggedPlanId;
    if (!planId) return;

    const planToMove = plans.find((p) => p.id === planId);
    if (planToMove && planToMove.status !== targetStatus) {
      onUpdatePlan({
        ...planToMove,
        status: targetStatus,
        updatedAt: new Date().toISOString(),
      });
    }
    setDraggedPlanId(null);
  };

  const moveColumnStep = (plan: PlanItem, direction: 'left' | 'right') => {
    const statusOrder: PlanStatus[] = ['todo', 'in_progress', 'blocked', 'completed'];
    const curIdx = statusOrder.indexOf(plan.status);
    const nextIdx = direction === 'left' ? curIdx - 1 : curIdx + 1;
    if (nextIdx >= 0 && nextIdx < statusOrder.length) {
      onUpdatePlan({
        ...plan,
        status: statusOrder[nextIdx],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colPlans = plans.filter((p) => p.status === col.id);
        const isDragTarget = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`bg-slate-50 border rounded-xl p-3 flex flex-col transition-all min-h-[500px] ${
              isDragTarget
                ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-200'
                : 'border-slate-200'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    STATUS_CONFIG[col.id].dot
                  }`}
                />
                <h3 className="text-xs font-bold text-slate-800">
                  {col.title}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded tabular-nums">
                  {colPlans.length}
                </span>
              </div>

              {/* Quick Add under this column */}
              <button
                type="button"
                onClick={() => onCreatePlanForStatus(col.id)}
                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded transition-colors"
                title={`在「${col.title}」新建计划`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Plans Stack */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {colPlans.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                  拖拽计划到此处 或 点击上方 + 添加
                </div>
              ) : (
                colPlans.map((plan) => {
                  const isCompleted = plan.status === 'completed';
                  const overdue = isOverdue(plan.dueDate, plan.status);
                  const subtasksCount = plan.subtasks?.length || 0;
                  const completedSubtasksCount =
                    plan.subtasks?.filter((s) => s.completed).length || 0;
                  const colorConfig = COLOR_PALETTE[plan.color] || COLOR_PALETTE.indigo;

                  return (
                    <div
                      key={plan.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, plan.id)}
                      onClick={() => onEditPlan(plan)}
                      className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      {/* Top badges: Priority & Category */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${
                            PRIORITY_CONFIG[plan.priority].bg
                          } ${PRIORITY_CONFIG[plan.priority].color} ${
                            PRIORITY_CONFIG[plan.priority].border
                          }`}
                        >
                          {PRIORITY_CONFIG[plan.priority].shortLabel}
                        </span>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {plan.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-xs font-semibold leading-snug mb-1.5 line-clamp-2 ${
                          isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 group-hover:text-indigo-600'
                        }`}
                      >
                        {plan.title}
                      </h4>

                      {/* Description excerpt */}
                      {plan.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                          {plan.description}
                        </p>
                      )}

                      {/* Subtask checklist progress if any */}
                      {subtasksCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 bg-slate-50 px-2 py-1 rounded">
                          <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                          <span className="tabular-nums">
                            {completedSubtasksCount}/{subtasksCount} 项子任务
                          </span>
                        </div>
                      )}

                      {/* Bottom row: Due date & Actions */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        {/* Due Date */}
                        <div
                          className={`flex items-center gap-1 text-[11px] tabular-nums ${
                            overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{formatFriendlyDate(plan.dueDate)}</span>
                          {overdue && (
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                          )}
                        </div>

                        {/* Card Fast Action Buttons */}
                        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                          {/* Shift Left */}
                          {col.id !== 'todo' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveColumnStep(plan, 'left');
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="向左流转状态"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditPlan(plan);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                            title="编辑计划详情"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePlan(plan.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="删除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Shift Right */}
                          {col.id !== 'completed' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveColumnStep(plan, 'right');
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="向右流转状态"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
