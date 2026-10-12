import React, { useState, useEffect } from 'react';
import { PlanItem, PlanPriority, PlanStatus, SubTask } from '../types/plan';
import { 
  X, 
  Trash2, 
  Plus, 
  Calendar as CalendarIcon, 
  Copy, 
  Check, 
  Tag
} from 'lucide-react';
import { getTodayDateString, addDays } from '../utils/dateUtils';
import { STATUS_CONFIG, PRIORITY_CONFIG, DEFAULT_CATEGORIES, COLOR_PALETTE } from '../utils/constants';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PlanItem) => void;
  onDelete?: (planId: string) => void;
  onDuplicate?: (plan: PlanItem) => void;
  initialPlan?: PlanItem | null;
  defaultDate?: string;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  initialPlan,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PlanStatus>('todo');
  const [priority, setPriority] = useState<PlanPriority>('p2');
  const [category, setCategory] = useState('工作');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState('indigo');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialPlan) {
        setTitle(initialPlan.title);
        setDescription(initialPlan.description || '');
        setStatus(initialPlan.status);
        setPriority(initialPlan.priority);
        setCategory(initialPlan.category);
        setStartDate(initialPlan.startDate);
        setDueDate(initialPlan.dueDate);
        setColor(initialPlan.color || 'indigo');
        setSubtasks(initialPlan.subtasks ? [...initialPlan.subtasks] : []);
      } else {
        const today = defaultDate || getTodayDateString();
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('p2');
        setCategory('工作');
        setStartDate(today);
        setDueDate(today);
        setColor('indigo');
        setSubtasks([]);
      }
      setNewSubtaskTitle('');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialPlan, defaultDate]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newTask: SubTask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newTask]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const nowIso = new Date().toISOString();
    const planToSave: PlanItem = {
      id: initialPlan?.id || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category: category.trim() || '默认',
      startDate: startDate || getTodayDateString(),
      dueDate: dueDate || startDate || getTodayDateString(),
      color,
      subtasks,
      createdAt: initialPlan?.createdAt || getTodayDateString(),
      updatedAt: nowIso,
    };

    onSave(planToSave);
    onClose();
  };

  const handleSetQuickDueDate = (daysOffset: number) => {
    const base = startDate || getTodayDateString();
    setDueDate(addDays(base, daysOffset));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {initialPlan ? '编辑计划' : '新建计划'}
            </h2>
            {initialPlan && (
              <span className="text-xs text-slate-400 font-mono">
                #{initialPlan.id.slice(-6)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              计划标题 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：完成产品发布方案、晨跑 5 公里..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                执行状态
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                {(['todo', 'in_progress', 'blocked', 'completed'] as PlanStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center ${
                      status === st
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {STATUS_CONFIG[st].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                优先级
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                {(['p0', 'p1', 'p2', 'p3'] as PlanPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center ${
                      priority === p
                        ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} font-semibold shadow-xs`
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {PRIORITY_CONFIG[p].shortLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dates & Quick Offset */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  开始日期
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  截止日期
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick date shortcuts */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                快捷截止:
              </span>
              <button
                type="button"
                onClick={() => setDueDate(getTodayDateString())}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                今天
              </button>
              <button
                type="button"
                onClick={() => setDueDate(addDays(getTodayDateString(), 1))}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                明天
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDueDate(3)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                +3天
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDueDate(7)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                +1周
              </button>
            </div>
          </div>

          {/* Category & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                所属分类 / 标签
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="输入或选择分类"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
                <div className="flex flex-wrap gap-1">
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                        category === cat
                          ? 'bg-slate-800 text-white font-medium'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                标识色彩
              </label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {Object.entries(COLOR_PALETTE).map(([colKey, colVal]) => (
                  <button
                    key={colKey}
                    type="button"
                    onClick={() => setColor(colKey)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      color === colKey
                        ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: colVal.accent }}
                    title={colVal.name}
                  >
                    {color === colKey && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              详细描述与备忘 (可选)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="记录具体行动步骤、所需资源、预期交付成果或注意事项..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed"
            />
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>子任务检查清单 ({subtasks.filter((s) => s.completed).length}/{subtasks.length})</span>
              </label>
            </div>

            {/* List of subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-3 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/80">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-white text-xs transition-colors"
                  >
                    <label className="flex items-center gap-2 flex-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span
                        className={`${
                          st.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new subtask row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="输入子任务后按回车或点击添加..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {initialPlan && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-rose-600 font-medium">确认删除?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(initialPlan.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-rose-600 text-white rounded hover:bg-rose-700"
                    >
                      是，删除
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="删除此计划"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {initialPlan && onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  onDuplicate(initialPlan);
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="复制此计划"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors"
            >
              {initialPlan ? '保存修改' : '确认创建'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
