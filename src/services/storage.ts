import { PlanItem } from '../types/plan';
import { getTodayDateString } from '../utils/dateUtils';

const STORAGE_KEY = 'planflow_user_plans_v1';
const LEGACY_STORAGE_KEY = 'planflow_plans_storage_v1';

export function loadPlansFromStorage(): PlanItem[] {
  try {
    // If legacy key existed with mock data, remove it to ensure clean slate
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any lingering mock plan IDs if any
      const cleaned = parsed.filter(
        (p) => p && typeof p.id === 'string' && !p.id.startsWith('plan-1') && !p.id.startsWith('plan-2') && !p.id.startsWith('plan-3') && !p.id.startsWith('plan-4') && !p.id.startsWith('plan-5') && !p.id.startsWith('plan-6') && !p.id.startsWith('plan-7')
      );
      return cleaned;
    }
    return [];
  } catch (err) {
    console.error('Failed to load plans from localStorage', err);
    return [];
  }
}

export function savePlansToStorage(plans: PlanItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save plans to localStorage', err);
  }
}

export function clearPlansInStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear plans in localStorage', err);
  }
}

export function exportPlansToJSON(plans: PlanItem[]): void {
  const exportData = {
    version: '1.0',
    exportTime: new Date().toISOString(),
    plansCount: plans.length,
    plans,
  };
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PlanFlow_备份_${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPlansToMarkdown(plans: PlanItem[]): void {
  const today = getTodayDateString();
  const statusLabels: Record<string, string> = {
    todo: '待办计划 (To Do)',
    in_progress: '正在进行 (In Progress)',
    blocked: '受阻/等待 (Blocked)',
    completed: '已完成 (Completed)',
  };

  const priorityLabels: Record<string, string> = {
    p0: 'P0 紧急',
    p1: 'P1 高优',
    p2: 'P2 中等',
    p3: 'P3 普通',
  };

  let md = `# PlanFlow 计划与日程清单\n\n`;
  md += `> 导出日期：${today} | 共计计划数：${plans.length} 项\n\n`;

  const statuses = ['todo', 'in_progress', 'blocked', 'completed'];

  statuses.forEach((st) => {
    const list = plans.filter((p) => p.status === st);
    md += `## ${statusLabels[st]} (${list.length})\n\n`;
    if (list.length === 0) {
      md += `*暂无此状态项目*\n\n`;
      return;
    }

    list.forEach((p, idx) => {
      const isDone = p.status === 'completed';
      const checkMark = isDone ? '[x]' : '[ ]';
      md += `### ${idx + 1}. - ${checkMark} ${p.title}\n`;
      md += `- **优先级**：${priorityLabels[p.priority] || p.priority}\n`;
      md += `- **分类标签**：${p.category || '未分类'}\n`;
      md += `- **时间区间**：${p.startDate} 至 ${p.dueDate}\n`;
      if (p.description) {
        md += `- **详细备忘**：${p.description}\n`;
      }
      if (p.subtasks && p.subtasks.length > 0) {
        md += `- **子任务清单**：\n`;
        p.subtasks.forEach((st) => {
          md += `  - ${st.completed ? '[x]' : '[ ]'} ${st.title}\n`;
        });
      }
      md += `\n`;
    });
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PlanFlow_计划清单_${today}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPlansToCSV(plans: PlanItem[]): void {
  const today = getTodayDateString();
  const statusLabels: Record<string, string> = {
    todo: '待办',
    in_progress: '进行中',
    blocked: '受阻/等待',
    completed: '已完成',
  };

  const priorityLabels: Record<string, string> = {
    p0: 'P0 紧急',
    p1: 'P1 高优',
    p2: 'P2 中等',
    p3: 'P3 普通',
  };

  const headers = ['标题', '执行状态', '优先级', '分类标签', '开始日期', '截止日期', '子任务完成度', '详细描述'];
  
  const rows = plans.map((p) => {
    const subtaskProgress = p.subtasks && p.subtasks.length > 0
      ? `${p.subtasks.filter((s) => s.completed).length}/${p.subtasks.length}`
      : '无';
    
    // Escape double quotes in CSV
    const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    return [
      escapeCsv(p.title),
      escapeCsv(statusLabels[p.status] || p.status),
      escapeCsv(priorityLabels[p.priority] || p.priority),
      escapeCsv(p.category || '默认'),
      escapeCsv(p.startDate || ''),
      escapeCsv(p.dueDate || ''),
      escapeCsv(subtaskProgress),
      escapeCsv(p.description || ''),
    ].join(',');
  });

  // Prepend \uFEFF for Excel UTF-8 BOM detection
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PlanFlow_表格数据_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importPlansFromJSON(file: File): Promise<PlanItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const plans = Array.isArray(parsed) ? parsed : parsed.plans;
        if (!Array.isArray(plans)) {
          throw new Error('导入文件格式不正确，缺少计划列表数组');
        }
        // Basic schema sanitization
        const sanitized: PlanItem[] = plans.map((p, idx) => ({
          id: p.id || `plan-${Date.now()}-${idx}`,
          title: String(p.title || '未命名计划'),
          description: String(p.description || ''),
          status: ['todo', 'in_progress', 'blocked', 'completed'].includes(p.status) ? p.status : 'todo',
          priority: ['p0', 'p1', 'p2', 'p3'].includes(p.priority) ? p.priority : 'p2',
          category: String(p.category || '默认'),
          startDate: String(p.startDate || getTodayDateString()),
          dueDate: String(p.dueDate || getTodayDateString()),
          color: p.color || 'indigo',
          subtasks: Array.isArray(p.subtasks)
            ? p.subtasks.map((s: { id?: string; title?: string; completed?: boolean }, sIdx: number) => ({
                id: s.id || `s-${Date.now()}-${sIdx}`,
                title: String(s.title || ''),
                completed: Boolean(s.completed),
              }))
            : [],
          createdAt: p.createdAt || getTodayDateString(),
          updatedAt: new Date().toISOString(),
        }));

        savePlansToStorage(sanitized);
        resolve(sanitized);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}
