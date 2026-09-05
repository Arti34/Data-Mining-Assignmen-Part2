import React from 'react';
import { X, Keyboard } from 'lucide-react';

export function KeyboardModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Create a new task' },
    { key: '⌘ / Ctrl + K', desc: 'Open Command Palette & fast search' },
    { key: '/', desc: 'Focus task search input' },
    { key: '1', desc: 'Switch to List View' },
    { key: '2', desc: 'Switch to Kanban Board View' },
    { key: '3', desc: 'Switch to Productivity Insights' },
    { key: 'D', desc: 'Toggle Dark / Light theme' },
    { key: '?', desc: 'Show keyboard shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close open dialogs and dismiss inputs' },
    { key: '⌘ / Ctrl + Enter', desc: 'Save task in create/edit modal' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-none text-xs">
              <span className="text-slate-600 dark:text-slate-400">{sc.desc}</span>
              <kbd className="font-mono text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
