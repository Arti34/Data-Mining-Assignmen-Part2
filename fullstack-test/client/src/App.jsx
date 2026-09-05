import React, { useState, useEffect, useCallback } from 'react';
import { useSound } from './hooks/useSound';
import { useTodos } from './hooks/useTodos';
import { useKeyboard } from './hooks/useKeyboard';

import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ListView } from './components/ListView';
import { KanbanView } from './components/KanbanView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardModal } from './components/KeyboardModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  const sound = useSound();
  const todosData = useTodos(sound);

  const [currentView, setCurrentView] = useState('list');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] = useState('todo');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);

  // Theme management
  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  // Handlers for task modal
  const handleOpenNewTask = useCallback((opts = {}) => {
    setTaskToEdit(null);
    setDefaultStatusForNewTask(opts.defaultStatus || 'todo');
    setIsTaskModalOpen(true);
  }, []);

  const handleOpenEditTask = useCallback((task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(async (taskData) => {
    if (taskData.id) {
      await todosData.updateTodo(taskData.id, taskData);
    } else {
      await todosData.createTodo(taskData);
    }
  }, [todosData]);

  // Global Keyboard Hook
  useKeyboard({
    onNewTask: () => handleOpenNewTask(),
    onSearchFocus: () => setIsCommandPaletteOpen(true),
    onViewChange: (v) => setCurrentView(v),
    onToggleTheme: toggleTheme,
    onToggleHelp: () => setIsKeyboardModalOpen(prev => !prev),
    onToggleCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onEscape: () => {
      setIsTaskModalOpen(false);
      setIsCommandPaletteOpen(false);
      setIsKeyboardModalOpen(false);
    }
  });

  const handleImportBackup = useCallback(async (backupData) => {
    try {
      await todosData.importBackup(backupData);
    } catch (e) {
      todosData.addToast('Failed to import backup data', 'error');
    }
  }, [todosData]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenKeyboardModal={() => setIsKeyboardModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEnabled={sound.soundEnabled}
        onToggleSound={sound.toggleSound}
        wsConnected={todosData.wsConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Filter bar is shown on List and Board views */}
        {currentView !== 'analytics' && (
          <div className="mb-6">
            <FilterBar
              filters={todosData.filters}
              setFilters={todosData.setFilters}
              categories={todosData.categories}
              tags={todosData.tags}
              counts={{ total: todosData.todos.length }}
              onBulkAction={todosData.bulkAction}
              onImportBackup={handleImportBackup}
            />
          </div>
        )}

        {/* Dynamic Views */}
        {todosData.loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Syncing your workspace...</p>
          </div>
        ) : (
          <>
            {currentView === 'list' && (
              <ListView
                todos={todosData.todos}
                onToggleStatus={todosData.toggleTodoStatus}
                onEdit={handleOpenEditTask}
                onDelete={todosData.deleteTodo}
                onDuplicate={todosData.duplicateTodo}
                onTogglePin={todosData.togglePin}
                onToggleSubtask={todosData.toggleSubtask}
                onAddSubtask={todosData.addSubtask}
                onDeleteSubtask={todosData.deleteSubtask}
                onReorder={todosData.reorderTodos}
                onOpenNewTask={() => handleOpenNewTask()}
              />
            )}

            {currentView === 'kanban' && (
              <KanbanView
                todos={todosData.todos}
                onUpdateTodo={todosData.updateTodo}
                onToggleStatus={todosData.toggleTodoStatus}
                onEdit={handleOpenEditTask}
                onDelete={todosData.deleteTodo}
                onDuplicate={todosData.duplicateTodo}
                onOpenNewTask={handleOpenNewTask}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView
                stats={todosData.stats}
                todos={todosData.todos}
              />
            )}
          </>
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={todosData.categories}
        tags={todosData.tags}
        defaultStatus={defaultStatusForNewTask}
      />

      {/* Cmd + K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        todos={todosData.todos}
        onSelectTodo={handleOpenEditTask}
        onNewTask={() => handleOpenNewTask()}
        onViewChange={setCurrentView}
        onToggleTheme={toggleTheme}
        onBulkAction={todosData.bulkAction}
        onSetFilter={(newFilter) => todosData.setFilters(prev => ({ ...prev, ...newFilter }))}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardModal
        isOpen={isKeyboardModalOpen}
        onClose={() => setIsKeyboardModalOpen(false)}
      />

      {/* Toast Stack */}
      <ToastContainer
        toasts={todosData.toasts}
        onDismiss={todosData.removeToast}
      />
    </div>
  );
}
