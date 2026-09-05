import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Star,
  FolderKanban,
  Tag as TagIcon,
  Check
} from 'lucide-react';

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  tags,
  defaultStatus = 'todo'
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState(defaultStatus);
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        setPriority(taskToEdit.priority || 'medium');
        setStatus(taskToEdit.status || defaultStatus);
        setDueDate(taskToEdit.due_date || '');
        setCategoryId(taskToEdit.category_id || '');
        setIsPinned(Boolean(taskToEdit.is_pinned));
        setEstimatedMinutes(taskToEdit.estimated_minutes || 0);
        setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);
        setSelectedTags(taskToEdit.tags ? taskToEdit.tags.map(t => t.id) : []);
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus(defaultStatus);
        setDueDate(new Date().toISOString().split('T')[0]);
        setCategoryId(categories[0]?.id || '');
        setIsPinned(false);
        setEstimatedMinutes(30);
        setSubtasks([]);
        setSelectedTags([]);
      }
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen, taskToEdit, defaultStatus, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: `temp-${Date.now()}`, title: newSubtaskInput.trim(), is_completed: false }
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (idx) => {
    setSubtasks(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      due_date: dueDate || null,
      category_id: categoryId || null,
      is_pinned: isPinned,
      estimated_minutes: Number(estimatedMinutes) || 0,
      subtasks,
      tags: selectedTags
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const priorities = [
    { id: 'low', label: 'Low', color: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400' },
    { id: 'medium', label: 'Medium', color: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-400' },
    { id: 'high', label: 'High', color: 'text-orange-600 dark:text-orange-400', activeBg: 'bg-orange-100 dark:bg-orange-950/60 border-orange-400' },
    { id: 'urgent', label: 'Urgent', color: 'text-rose-600 dark:text-rose-400', activeBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-400' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <input
              ref={titleInputRef}
              type="text"
              required
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              rows={2}
              placeholder="Add notes, context, or links (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Priority selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    priority === p.id
                      ? `${p.activeBg} ${p.color} shadow-sm`
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">None (Uncategorized)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Pinned & Time Estimation */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <span className="flex items-center gap-1">
                <Star className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                <span>Pin to top</span>
              </span>
            </label>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Est:</span>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-16 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span>mins</span>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                        isSelected
                          ? 'bg-brand-50 text-brand-700 border-brand-300 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800 shadow-sm'
                          : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtasks Checklist */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Checklist / Subtasks ({subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st, idx) => (
                <div key={st.id || idx} className="flex items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add subtask and hit enter..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(e); }}
                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Press <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">⌘+Enter</kbd> to save
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 rounded-lg shadow-sm transition-all"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
