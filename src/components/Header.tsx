import React from 'react';
import { ViewMode } from '../types/plan';
import { 
  Calendar as CalendarIcon, 
  ListOrdered, 
  Kanban as KanbanIcon, 
  Plus, 
  FolderDown, 
  FolderUp, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenCreateModal: () => void;
  onExport: () => void;
  onOpenImport: () => void;
  onClearAll: () => void;
  savedTimeText: string;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onOpenCreateModal,
  onExport,
  onOpenImport,
  onClearAll,
  savedTimeText,
}) => {
  const [showDataMenu, setShowDataMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDataMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Autosave Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold shadow-xs">
            <span className="text-base tracking-tighter">PF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                PlanFlow
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 font-normal">
                计划大师
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>内部数据已实时保存</span>
              <span className="text-slate-400 text-[11px] tabular-nums">({savedTimeText})</span>
            </div>
          </div>
        </div>

        {/* Zone 2: View Switcher Segmented Control */}
        <nav className="flex items-center p-1 bg-slate-100 rounded-lg text-sm font-medium">
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="计划列表视图"
          >
            <ListOrdered className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>计划列表</span>
          </button>

          <button
            onClick={() => onViewModeChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'calendar'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="日历视图"
          >
            <CalendarIcon className="w-4 h-4 shrink-0 text-blue-600" />
            <span>日历视图</span>
          </button>

          <button
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="看板视图"
          >
            <KanbanIcon className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>看板视图</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Data management & Create Plan) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Data Actions Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowDataMenu(!showDataMenu)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
              title="数据备份与恢复"
            >
              <FolderDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">数据备份</span>
            </button>

            {showDataMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-40 text-xs">
                <button
                  onClick={() => {
                    setShowDataMenu(false);
                    onExport();
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FolderDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>导出计划备份 (JSON)</span>
                </button>
                <button
                  onClick={() => {
                    setShowDataMenu(false);
                    onOpenImport();
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FolderUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>导入计划数据</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setShowDataMenu(false);
                    onClearAll();
                  }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>清空所有计划</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Create Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>新建计划</span>
          </button>
        </div>
      </div>
    </header>
  );
};
