import React, { useState } from 'react';
import {
  Check,
  Star,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  AlertCircle,
  Plus,
  GripVertical
} from 'lucide-react';

export function TaskItem({
  todo,
  onToggleStatus,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePin,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  isDragging,
  dragHandleProps
}) {
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const isCompleted = todo.status === 'completed';
  const subtasks = todo.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.is_completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  // Format due date helper
  const getDueBadge = () => {
    if (!todo.due_date) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const [y, m, d] = todo.due_date.split('-').map(Number);
    const dueDate = new Date(y, m - 1, d).getTime();
    const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && !isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md ring-1 ring-rose-200 dark:ring-rose-900/50">
          <AlertCircle className="w-3 h-3" />
          <span>Overdue</span>
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md ring-1 ring-amber-200 dark:ring-amber-900/50">
          <Clock className="w-3 h-3" />
          <span>Today</span>
        </span>
      );
    }
    if (diffDays === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md ring-1 ring-blue-200 dark:ring-blue-900/50">
          <Calendar className="w-3 h-3" />
          <span>Tomorrow</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
        <Calendar className="w-3 h-3" />
        <span>{todo.due_date}</span>
      </span>
    );
  };

  const getPriorityBadge = () => {
    switch (todo.priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md ring-1 ring-rose-300 dark:ring-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
            Med
          </span>
        );
      case 'low':
      default:
        return (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
            Low
          </span>
        );
    }
  };

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(todo.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  return (
    <div
      className={`group relative rounded-xl border bg-white dark:bg-slate-900 transition-all duration-200 ${
        isDragging
          ? 'opacity-40 shadow-2xl scale-[1.02] border-brand-500'
          : 'hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow'
      } ${
        isCompleted
          ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40'
          : todo.is_pinned
          ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/10 dark:bg-amber-950/10'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Drag Handle */}
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            aria-label="Drag to reorder"
            className="mt-0.5 text-slate-300 hover:text-slate-600 dark:text-slate-700 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing transition-colors focus:outline-none"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Checkbox */}
        <button
          onClick={() => onToggleStatus(todo.id)}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm checkbox-animate'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 bg-transparent'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3] animate-scale-in" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onEdit(todo)}
              className={`text-sm font-semibold tracking-tight cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {todo.title}
            </h3>

            {/* Category badge */}
            {todo.category_name && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-md border"
                style={{
                  color: todo.category_color,
                  backgroundColor: `${todo.category_color}15`,
                  borderColor: `${todo.category_color}30`
                }}
              >
                {todo.category_name}
              </span>
            )}

            {/* Priority badge */}
            {getPriorityBadge()}

            {/* Due date badge */}
            {getDueBadge()}
          </div>

          {/* Description */}
          {todo.description && (
            <p
              onClick={() => onEdit(todo)}
              className={`text-xs mt-1 line-clamp-2 cursor-pointer ${
                isCompleted
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Tags & Subtask Counters */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
            {/* Tags */}
            {todo.tags?.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
              >
                #{tag.name}
              </span>
            ))}

            {/* Estimated time */}
            {todo.estimated_minutes > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{todo.estimated_minutes}m</span>
              </span>
            )}

            {/* Subtasks pill & toggle */}
            {subtasks.length > 0 && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <div className="w-10 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  ></div>
                </div>
                <span>{completedSubtasks}/{subtasks.length}</span>
                {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Inline Subtasks Accordion */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="space-y-1.5">
                {subtasks.map(st => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group/st"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.is_completed}
                        onChange={(e) => onToggleSubtask(todo.id, st.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-brand-600 focus:ring-brand-500 dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <span className={`truncate ${st.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                        {st.title}
                      </span>
                    </label>

                    <button
                      onClick={() => onDeleteSubtask(todo.id, st.id)}
                      className="opacity-0 group-hover/st:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition-opacity"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask inline input */}
              {isAddingSubtask ? (
                <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Subtask title..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-brand-600 text-white rounded text-xs font-medium hover:bg-brand-500"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingSubtask(false)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingSubtask(true)}
                  className="flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 hover:underline pt-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add checklist item</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pinned star button */}
        <button
          onClick={() => onTogglePin(todo.id)}
          aria-label={todo.is_pinned ? 'Unpin task' : 'Pin task to top'}
          className={`p-1 rounded-md transition-colors ${
            todo.is_pinned
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-300 hover:text-amber-400 dark:text-slate-700 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100'
          }`}
          title={todo.is_pinned ? 'Pinned to top' : 'Pin to top'}
        >
          <Star className={`w-4 h-4 ${todo.is_pinned ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Action Menu */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(todo)}
            aria-label="Edit task"
            className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Edit task"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDuplicate(todo.id)}
            aria-label="Duplicate task"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Duplicate task"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(todo.id)}
            aria-label="Delete task"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
