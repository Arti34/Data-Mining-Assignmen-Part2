import React, { useState } from 'react';
import {
  Circle,
  Clock,
  CheckCircle2,
  Plus,
  MoreHorizontal,
  Star,
  Calendar,
  AlertCircle
} from 'lucide-react';

export function KanbanView({
  todos,
  onUpdateTodo,
  onToggleStatus,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenNewTask
}) {
  const [draggedTodoId, setDraggedTodoId] = useState(null);

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      icon: Circle,
      color: 'text-slate-500 dark:text-slate-400',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: Clock,
      color: 'text-indigo-500 dark:text-indigo-400',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
    }
  ];

  const handleDragStart = (e, id) => {
    setDraggedTodoId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedTodoId) return;

    const todo = todos.find(t => t.id === draggedTodoId);
    if (todo && todo.status !== targetStatus) {
      onUpdateTodo(draggedTodoId, { status: targetStatus });
    }
    setDraggedTodoId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-12 items-start">
      {columns.map(col => {
        const colTodos = todos.filter(t => t.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 min-h-[480px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${col.color}`} />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {col.title}
                </h3>
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                  {colTodos.length}
                </span>
              </div>

              <button
                onClick={() => onOpenNewTask({ defaultStatus: col.id })}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {colTodos.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Drop tasks here
                </div>
              ) : (
                colTodos.map(todo => {
                  const subtasks = todo.subtasks || [];
                  const completedSubtasks = subtasks.filter(s => s.is_completed).length;

                  return (
                    <div
                      key={todo.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, todo.id)}
                      className={`group bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing ${
                        draggedTodoId === todo.id ? 'opacity-40 scale-95' : ''
                      } ${
                        todo.is_pinned
                          ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/10'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          onClick={() => onEdit(todo)}
                          className="text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer line-clamp-2"
                        >
                          {todo.title}
                        </span>

                        {todo.is_pinned && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>

                      {todo.description && (
                        <p
                          onClick={() => onEdit(todo)}
                          className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 cursor-pointer"
                        >
                          {todo.description}
                        </p>
                      )}

                      {/* Footer: Category, Due Date, Subtask count */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {todo.category_name && (
                            <span
                              className="px-1.5 py-0.5 rounded font-medium"
                              style={{
                                color: todo.category_color,
                                backgroundColor: `${todo.category_color}15`
                              }}
                            >
                              {todo.category_name}
                            </span>
                          )}

                          {todo.due_date && (
                            <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3 h-3" />
                              <span>{todo.due_date}</span>
                            </span>
                          )}
                        </div>

                        {subtasks.length > 0 && (
                          <span className="text-slate-400 font-mono">
                            {completedSubtasks}/{subtasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => onOpenNewTask({ defaultStatus: col.id })}
              className="mt-2.5 w-full py-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800/80 rounded-xl transition-colors font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add task</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
