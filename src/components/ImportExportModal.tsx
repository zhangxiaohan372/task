import React, { useRef, useState } from 'react';
import { PlanItem } from '../types/plan';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  exportPlansToJSON, 
  exportPlansToMarkdown, 
  exportPlansToCSV, 
  importPlansFromJSON 
} from '../services/storage';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: PlanItem[];
  onImportSuccess: (importedPlans: PlanItem[]) => void;
  onClearAll: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  plans,
  onImportSuccess,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportPlansToJSON(plans);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      setImportStatus('正在导入...');
      const imported = await importPlansFromJSON(file);
      onImportSuccess(imported);
      setImportStatus(`成功导入 ${imported.length} 条计划！`);
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setImportStatus(null);
      setErrorMessage(
        err instanceof Error ? err.message : '文件解析失败，请检查是否为有效的 PlanFlow JSON 备份。'
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmClear = () => {
    onClearAll();
    setIsResetConfirming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">数据备份与导入恢复</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            PlanFlow 内部数据已默认保存在当前浏览器的本地存储（LocalStorage）中。您可以将数据下载为 JSON 文件进行长效归档，或在不同设备间迁移数据。
          </p>

          {/* Export Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">下载计划数据到本地</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  包含当前全部 {plans.length} 条计划项、子任务与时间排期
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                title="导出标准 JSON 文件，用于后续在网页中完整导入恢复"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON 完整备份</span>
              </button>

              <button
                type="button"
                onClick={() => exportPlansToMarkdown(plans)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="导出为 Markdown 文本，可直接用 Obsidian、Notion 或本地文本编辑器查看"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Markdown 清单</span>
              </button>

              <button
                type="button"
                onClick={() => exportPlansToCSV(plans)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="导出为 CSV 表格，可直接在 Excel 或 WPS 中打开"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel (CSV) 表格</span>
              </button>
            </div>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800">导入备份文件</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  支持上传先前导出的 .json 备份文件
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>选择文件</span>
              </button>
            </div>

            {importStatus && (
              <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{importStatus}</span>
              </div>
            )}
            {errorMessage && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Local Run & Code Info */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-indigo-50/40 text-xs space-y-1.5">
            <h4 className="font-semibold text-indigo-950 flex items-center gap-1.5">
              <span>💻 想把整个项目源码下载到本地电脑运行？</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              1. 在当前 AI Studio 平台右上角点击导出（或连接 GitHub 仓库同步源码）。<br />
              2. 在本地电脑解压并打开终端进入文件夹。<br />
              3. 执行命令：<code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-700 font-mono text-[11px]">npm install</code> 安装依赖。<br />
              4. 执行命令：<code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-700 font-mono text-[11px]">npm run dev</code> 即可在本地启动网页服务！
            </p>
          </div>

          {/* Clear All Data */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {isResetConfirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-medium">
                  将清空全部计划数据，确定？
                </span>
                <button
                  onClick={handleConfirmClear}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700"
                >
                  确定清空
                </button>
                <button
                  onClick={() => setIsResetConfirming(false)}
                  className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsResetConfirming(true)}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清空所有计划数据</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 ml-auto"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
