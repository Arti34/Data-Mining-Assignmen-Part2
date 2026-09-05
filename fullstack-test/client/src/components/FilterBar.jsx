import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Download,
  Upload,
  CheckCheck,
  Trash2,
  Calendar,
  AlertTriangle,
  FolderKanban,
  Tag
} from 'lucide-react';

export function FilterBar({
  filters,
  setFilters,
  categories,
  tags,
  counts,
  onBulkAction,
  onImportBackup
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImportBackup(parsed);
      } catch (err) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setMenuOpen(false);
  };

  const statusPresets = [
    { id: 'all', label: 'All' },
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusPresets.map(preset => {
            const isActive = filters.status === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setFilters(prev => ({ ...prev, status: preset.id }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

          {/* Quick toggle for Urgent */}
          <button
            onClick={() => setFilters(prev => ({
              ...prev,
              priority: prev.priority === 'urgent' ? 'all' : 'urgent'
            }))}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filters.priority === 'urgent'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 ring-1 ring-rose-300 dark:ring-rose-800'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Urgent</span>
          </button>
        </div>

        {/* Secondary Filters & Dropdowns */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={filters.category_id}
              onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
              aria-label="Filter by category"
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              aria-label="Sort tasks by"
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-sm"
            >
              <option value="order">Custom Order</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created_at">Date Created</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* More Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="More actions and export"
              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
              title="More Actions"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 glass-dropdown z-40 py-1.5 text-xs text-slate-700 dark:text-slate-300 animate-slide-up">
                <button
                  onClick={() => { onBulkAction('complete_all'); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  <span>Mark All Complete</span>
                </button>

                <button
                  onClick={() => { onBulkAction('delete_completed'); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Completed</span>
                </button>

                <div className="my-1 border-t border-slate-200 dark:border-slate-800"></div>

                <a
                  href="/api/data/export/csv"
                  download
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Export to CSV</span>
                </a>

                <a
                  href="/api/data/export/json"
                  download
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>Export Backup (JSON)</span>
                </a>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-purple-500" />
                  <span>Import Backup</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
