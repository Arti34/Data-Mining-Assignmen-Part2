import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  ListTodo,
  Kanban,
  BarChart3,
  Moon,
  Sun,
  CheckCheck,
  Download,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

export function CommandPalette({
  isOpen,
  onClose,
  todos,
  onSelectTodo,
  onNewTask,
  onViewChange,
  onToggleTheme,
  onBulkAction,
  onSetFilter
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Predefined actions
  const staticActions = [
    {
      id: 'action-new-task',
      title: 'Create new task',
      category: 'Actions',
      icon: Plus,
      run: () => { onClose(); onNewTask(); }
    },
    {
      id: 'action-view-list',
      title: 'Switch to List View',
      category: 'Navigation',
      icon: ListTodo,
      run: () => { onClose(); onViewChange('list'); }
    },
    {
      id: 'action-view-kanban',
      title: 'Switch to Kanban Board',
      category: 'Navigation',
      icon: Kanban,
      run: () => { onClose(); onViewChange('kanban'); }
    },
    {
      id: 'action-view-analytics',
      title: 'Switch to Productivity Insights',
      category: 'Navigation',
      icon: BarChart3,
      run: () => { onClose(); onViewChange('analytics'); }
    },
    {
      id: 'action-toggle-theme',
      title: 'Toggle Dark / Light Theme',
      category: 'Preferences',
      icon: Moon,
      run: () => { onClose(); onToggleTheme(); }
    },
    {
      id: 'action-filter-urgent',
      title: 'Filter: Show Urgent tasks',
      category: 'Filters',
      icon: AlertTriangle,
      run: () => { onClose(); onSetFilter({ priority: 'urgent' }); }
    },
    {
      id: 'action-filter-today',
      title: 'Filter: Due Today',
      category: 'Filters',
      icon: Clock,
      run: () => { onClose(); onSetFilter({ status: 'all' }); }
    },
    {
      id: 'action-complete-all',
      title: 'Mark all active tasks as complete',
      category: 'Actions',
      icon: CheckCheck,
      run: () => { onClose(); onBulkAction('complete_all'); }
    }
  ];

  // Matching tasks
  const matchedTodos = (todos || [])
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || (t.description && t.description.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 5)
    .map(t => ({
      id: `todo-${t.id}`,
      title: t.title,
      category: 'Tasks',
      icon: t.status === 'completed' ? CheckCheck : ListTodo,
      subtitle: `${t.priority} priority • ${t.category_name || 'Uncategorized'}`,
      run: () => { onClose(); onSelectTodo(t); }
    }));

  const matchedActions = staticActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const combinedItems = [...matchedTodos, ...matchedActions];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, combinedItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + combinedItems.length) % Math.max(1, combinedItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedItems[selectedIndex]) {
        combinedItems[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in"
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search tasks..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="flex-1 text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 p-0"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {combinedItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching tasks or commands
            </div>
          ) : (
            combinedItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-brand-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
