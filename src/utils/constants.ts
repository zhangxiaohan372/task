import { PlanPriority, PlanStatus } from '../types/plan';

export const STATUS_CONFIG: Record<
  PlanStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    lightBg: string;
  }
> = {
  todo: {
    label: '待办',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    lightBg: 'bg-slate-50',
  },
  in_progress: {
    label: '进行中',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    lightBg: 'bg-blue-50/40',
  },
  blocked: {
    label: '受阻/等待',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    lightBg: 'bg-rose-50/40',
  },
  completed: {
    label: '已完成',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    lightBg: 'bg-emerald-50/40',
  },
};

export const PRIORITY_CONFIG: Record<
  PlanPriority,
  {
    label: string;
    shortLabel: string;
    color: string;
    border: string;
    bg: string;
  }
> = {
  p0: {
    label: 'P0 极高 (紧急)',
    shortLabel: 'P0 紧急',
    color: 'text-rose-700',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
  },
  p1: {
    label: 'P1 高优先级',
    shortLabel: 'P1 高优',
    color: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  p2: {
    label: 'P2 中等优先级',
    shortLabel: 'P2 中等',
    color: 'text-indigo-700',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
  },
  p3: {
    label: 'P3 普通/低',
    shortLabel: 'P3 普通',
    color: 'text-slate-600',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
  },
};

export const COLOR_PALETTE: Record<
  string,
  { name: string; bg: string; text: string; border: string; accent: string }
> = {
  indigo: {
    name: '靛蓝',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    accent: '#4f46e5',
  },
  sky: {
    name: '天蓝',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    accent: '#0284c7',
  },
  emerald: {
    name: '翡翠绿',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: '#059669',
  },
  amber: {
    name: '琥珀黄',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: '#d97706',
  },
  rose: {
    name: '玫瑰红',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: '#e11d48',
  },
  purple: {
    name: '丁香紫',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    accent: '#9333ea',
  },
  teal: {
    name: '青碧',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    accent: '#0d9488',
  },
};

export const DEFAULT_CATEGORIES = ['工作', '学习', '健康', '生活', '项目', '财务', '个人'];
