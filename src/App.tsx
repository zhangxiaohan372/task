/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PlanItem, PlanPriority, PlanStatus, ViewMode, PlanFilterState } from './types/plan';
import { 
  loadPlansFromStorage, 
  savePlansToStorage, 
  clearPlansInStorage, 
  exportPlansToJSON 
} from './services/storage';
import { getTodayDateString } from './utils/dateUtils';
import { Header } from './components/Header';
import { PlanStats } from './components/PlanStats';
import { FilterBar } from './components/FilterBar';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { KanbanView } from './components/KanbanView';
import { PlanModal } from './components/PlanModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Check, Info } from 'lucide-react';

export default function App() {
  // Main plans state loaded from browser storage
  const [plans, setPlans] = useState<PlanItem[]>(() => loadPlansFromStorage());
  const [savedTimeText, setSavedTimeText] = useState<string>('刚刚');

  // View mode switcher: 'list' | 'calendar' | 'kanban'
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter state
  const [filters, setFilters] = useState<PlanFilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState<string | undefined>();
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Transient Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  // Sync to localStorage whenever plans change
  useEffect(() => {
    savePlansToStorage(plans);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    setSavedTimeText(`${hours}:${minutes}:${seconds}`);
  }, [plans]);

  // Unique categories gathered from existing plans
  const categories = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [plans]);

  // Filtered & Sorted plans list
  const filteredPlans = useMemo(() => {
    return plans
      .filter((plan) => {
        // Search query filter
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = plan.title.toLowerCase().includes(q);
          const matchDesc = plan.description?.toLowerCase().includes(q);
          const matchSubtask = plan.subtasks?.some((st) =>
            st.title.toLowerCase().includes(q)
          );
          const matchCat = plan.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSubtask && !matchCat) return false;
        }

        // Status filter
        if (filters.status !== 'all' && plan.status !== filters.status) {
          return false;
        }

        // Priority filter
        if (filters.priority !== 'all' && plan.priority !== filters.priority) {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && plan.category !== filters.category) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (filters.sortBy === 'dueDate') {
          comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
        } else if (filters.sortBy === 'priority') {
          const priorityRank: Record<PlanPriority, number> = {
            p0: 0,
            p1: 1,
            p2: 2,
            p3: 3,
          };
          comparison = priorityRank[a.priority] - priorityRank[b.priority];
        } else if (filters.sortBy === 'createdAt') {
          comparison = (a.createdAt || '').localeCompare(b.createdAt || '');
        } else if (filters.sortBy === 'title') {
          comparison = a.title.localeCompare(b.title, 'zh-CN');
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [plans, filters]);

  // Operations:
  const handleSavePlan = (planToSave: PlanItem) => {
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === planToSave.id);
      if (exists) {
        return prev.map((p) => (p.id === planToSave.id ? planToSave : p));
      }
      return [planToSave, ...prev];
    });
    showToast(editingPlan ? '计划修改已保存' : '新计划创建成功');
    setEditingPlan(null);
  };

  const handleUpdatePlan = (updatedPlan: PlanItem) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  };

  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    showToast('计划已删除');
  };

  const handleDuplicatePlan = (sourcePlan: PlanItem) => {
    const duplicated: PlanItem = {
      ...sourcePlan,
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${sourcePlan.title} (副本)`,
      subtasks: sourcePlan.subtasks.map((st) => ({
        ...st,
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        completed: false,
      })),
      createdAt: getTodayDateString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans((prev) => [duplicated, ...prev]);
    showToast('计划已创建副本');
  };

  const handleQuickAdd = (title: string, dueDate: string, priority: PlanPriority) => {
    const newPlan: PlanItem = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description: '',
      status: 'todo',
      priority,
      category: '工作',
      startDate: getTodayDateString(),
      dueDate,
      color: 'indigo',
      subtasks: [],
      createdAt: getTodayDateString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans((prev) => [newPlan, ...prev]);
    showToast('计划已快速添加');
  };

  const handleOpenCreateForDate = (dateStr: string) => {
    setEditingPlan(null);
    setDefaultDateForModal(dateStr);
    setIsPlanModalOpen(true);
  };

  const handleOpenCreateForStatus = (status: PlanStatus) => {
    const emptyWithStatus: PlanItem = {
      id: '',
      title: '',
      description: '',
      status,
      priority: 'p2',
      category: '工作',
      startDate: getTodayDateString(),
      dueDate: getTodayDateString(),
      color: 'indigo',
      subtasks: [],
      createdAt: getTodayDateString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPlan(emptyWithStatus);
    setDefaultDateForModal(getTodayDateString());
    setIsPlanModalOpen(true);
  };

  const handleOpenEdit = (plan: PlanItem) => {
    setEditingPlan(plan);
    setDefaultDateForModal(plan.dueDate);
    setIsPlanModalOpen(true);
  };

  const handleClearAllPlans = () => {
    setPlans([]);
    clearPlansInStorage();
    showToast('已清空所有计划数据');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenCreateModal={() => {
          setEditingPlan(null);
          setDefaultDateForModal(getTodayDateString());
          setIsPlanModalOpen(true);
        }}
        onExport={() => exportPlansToJSON(plans)}
        onOpenImport={() => setIsImportExportOpen(true)}
        onClearAll={handleClearAllPlans}
        savedTimeText={savedTimeText}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* Top Summary Metrics */}
        <PlanStats
          plans={plans}
          currentStatusFilter={filters.status}
          onSelectStatusFilter={(status) => setFilters({ ...filters, status })}
        />

        {/* Global Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
        />

        {/* Active View Container */}
        <div className="transition-all duration-200">
          {viewMode === 'list' && (
            <ListView
              plans={filteredPlans}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
              onDuplicatePlan={handleDuplicatePlan}
              onEditPlan={handleOpenEdit}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {viewMode === 'calendar' && (
            <CalendarView
              plans={filteredPlans}
              onUpdatePlan={handleUpdatePlan}
              onEditPlan={handleOpenEdit}
              onCreatePlanForDate={handleOpenCreateForDate}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {viewMode === 'kanban' && (
            <KanbanView
              plans={filteredPlans}
              onUpdatePlan={handleUpdatePlan}
              onEditPlan={handleOpenEdit}
              onDeletePlan={handleDeletePlan}
              onCreatePlanForStatus={handleOpenCreateForStatus}
            />
          )}
        </div>
      </main>

      {/* Global Plan Modal (Works seamlessly across List, Calendar, and Kanban) */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        onDelete={handleDeletePlan}
        onDuplicate={handleDuplicatePlan}
        initialPlan={editingPlan}
        defaultDate={defaultDateForModal}
      />

      {/* Import/Export Backup Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        plans={plans}
        onImportSuccess={(imported) => {
          setPlans(imported);
          showToast(`已成功载入 ${imported.length} 条计划`);
        }}
        onClearAll={handleClearAllPlans}
      />

      {/* Subtle Bottom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-400">
        <p>PlanFlow · 数据保存在当前浏览器本地 · 随时支持 JSON 备份与还原</p>
      </footer>
    </div>
  );
}
