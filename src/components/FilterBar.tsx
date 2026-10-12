import React from 'react';
import { PlanFilterState, PlanPriority, PlanStatus } from '../types/plan';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/constants';

interface FilterBarProps {
  filters: PlanFilterState;
  onFilterChange: (filters: PlanFilterState) => void;
  categories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
}) => {
  const mergedCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories]));

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all';

  const resetFilters = () => {
    onFilterChange({
      ...filters,
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="搜索计划名称、描述、子任务..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">状态:</span>
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ ...filters, status: e.target.value as 'all' | PlanStatus })
              }
              aria-label="选择状态过滤"
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">全部状态</option>
              <option value="todo">待办</option>
              <option value="in_progress">进行中</option>
              <option value="blocked">受阻/等待</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">优先级:</span>
            <select
              value={filters.priority}
              onChange={(e) =>
                onFilterChange({ ...filters, priority: e.target.value as 'all' | PlanPriority })
              }
              aria-label="选择优先级过滤"
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">全部级别</option>
              <option value="p0">P0 紧急高危</option>
              <option value="p1">P1 高优</option>
              <option value="p2">P2 中等</option>
              <option value="p3">P3 普通</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">分类:</span>
            <select
              value={filters.category}
              onChange={(e) =>
                onFilterChange({ ...filters, category: e.target.value })
              }
              aria-label="选择分类过滤"
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer max-w-[120px] truncate"
            >
              <option value="all">全部分类</option>
              {mergedCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  'dueDate' | 'priority' | 'createdAt' | 'title',
                  'asc' | 'desc'
                ];
                onFilterChange({ ...filters, sortBy, sortOrder });
              }}
              aria-label="选择排序方式"
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="dueDate-asc">截止日期 (近到远)</option>
              <option value="dueDate-desc">截止日期 (远到近)</option>
              <option value="priority-asc">优先级 (高到低)</option>
              <option value="createdAt-desc">创建时间 (新到旧)</option>
              <option value="title-asc">标题字母序</option>
            </select>
          </div>

          {/* Reset button if active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap ml-auto"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>清空筛选</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
