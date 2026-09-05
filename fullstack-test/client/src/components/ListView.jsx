import React, { useState } from 'react';
import { TaskItem } from './TaskItem';
import { Sparkles, Plus, CheckCircle2 } from 'lucide-react';

export function ListView({
  todos,
  onToggleStatus,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePin,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onReorder,
  onOpenNewTask
}) {
  const [draggedId, setDraggedId] = useState(null);

  const pinnedTodos = todos.filter(t => t.is_pinned);
  const regularTodos = todos.filter(t => !t.is_pinned);

  // Drag and drop handlers
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentTodos = [...todos];
    const sourceIdx = currentTodos.findIndex(t => t.id === draggedId);
    const targetIdx = currentTodos.findIndex(t => t.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [moved] = currentTodos.splice(sourceIdx, 1);
      currentTodos.splice(targetIdx, 0, moved);
      onReorder(currentTodos);
    }
    setDraggedId(null);
  };

  if (todos.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Sparkles className="w-8 h-8 text-brand-500 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">No tasks found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          Everything is cleared out or no tasks match your current filter criteria.
        </p>
        <button
          onClick={onOpenNewTask}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create a Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Pinned Tasks */}
      {pinnedTodos.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            <span>Pinned Focus</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-full font-mono">
              {pinnedTodos.length}
            </span>
          </div>
          <div className="space-y-2">
            {pinnedTodos.map(todo => (
              <div
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, todo.id)}
              >
                <TaskItem
                  todo={todo}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onTogglePin={onTogglePin}
                  onToggleSubtask={onToggleSubtask}
                  onAddSubtask={onAddSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  isDragging={draggedId === todo.id}
                  dragHandleProps={{}}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Tasks */}
      <div className="space-y-2.5">
        {pinnedTodos.length > 0 && regularTodos.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 pt-2">
            <span>Tasks</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-full font-mono">
              {regularTodos.length}
            </span>
          </div>
        )}
        <div className="space-y-2">
          {regularTodos.map(todo => (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, todo.id)}
            >
              <TaskItem
                todo={todo}
                onToggleStatus={onToggleStatus}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onTogglePin={onTogglePin}
                onToggleSubtask={onToggleSubtask}
                onAddSubtask={onAddSubtask}
                onDeleteSubtask={onDeleteSubtask}
                isDragging={draggedId === todo.id}
                dragHandleProps={{}}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
