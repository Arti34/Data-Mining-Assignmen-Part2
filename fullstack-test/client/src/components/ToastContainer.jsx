import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          error: <AlertCircle className="w-4 h-4 text-rose-500" />,
          info: <Info className="w-4 h-4 text-blue-500" />
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl animate-slide-up text-xs text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icons[toast.type] || icons.info}
              <span className="font-medium truncate">{toast.message}</span>
            </div>

            <div className="flex items-center gap-2">
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action.onClick();
                    onDismiss(toast.id);
                  }}
                  className="px-2 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-300 font-semibold rounded-md transition-colors"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
