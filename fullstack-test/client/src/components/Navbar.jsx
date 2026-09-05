import React from 'react';
import {
  CheckCircle2,
  ListTodo,
  Kanban,
  BarChart3,
  Search,
  Plus,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  HelpCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

export function Navbar({
  currentView,
  onViewChange,
  onOpenNewTask,
  onOpenCommandPalette,
  onOpenKeyboardModal,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  wsConnected
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 glass-panel bg-white/80 dark:bg-slate-900/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                TaskFlow
              </span>
              <div className="flex items-center gap-1.5 text-[11px] leading-none text-slate-500 dark:text-slate-400">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span>{wsConnected ? 'Live Sync' : 'Reconnecting...'}</span>
              </div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <nav aria-label="Views" className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 ml-2">
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="List View (Press 1)"
            >
              <ListTodo className="w-4 h-4" />
              <span>List</span>
              <kbd className="hidden lg:inline-block ml-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">1</kbd>
            </button>

            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Kanban Board (Press 2)"
            >
              <Kanban className="w-4 h-4" />
              <span>Board</span>
              <kbd className="hidden lg:inline-block ml-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">2</kbd>
            </button>

            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'analytics'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Productivity Analytics (Press 3)"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Insights</span>
              <kbd className="hidden lg:inline-block ml-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">3</kbd>
            </button>
          </nav>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2">
          {/* Quick Search trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            title="Search & Commands (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search tasks...</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={soundEnabled ? 'Mute sounds' : 'Enable completion sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (D)`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Keyboard Help */}
          <button
            onClick={onOpenKeyboardModal}
            aria-label="Keyboard shortcuts"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:inline-flex"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-95"
            title="Create Task (N)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">New Task</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 bg-brand-700/50 rounded text-[10px] font-mono">N</kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
