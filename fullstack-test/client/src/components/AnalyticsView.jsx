import React from 'react';
import {
  CheckCircle2,
  Flame,
  Clock,
  TrendingUp,
  AlertCircle,
  FolderKanban,
  Zap,
  Target
} from 'lucide-react';

export function AnalyticsView({ stats, todos }) {
  const summary = stats?.summary || {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    completionRate: 0,
    totalMinutes: 0,
    completedMinutes: 0,
    streakDays: 0
  };

  const categories = stats?.categories || [];
  const priorities = stats?.priorities || [];

  const plannedHours = (summary.totalMinutes / 60).toFixed(1);
  const completedHours = (summary.completedMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {summary.completionRate}%
            </span>
            <span className="text-xs text-slate-500">
              ({summary.completed}/{summary.total} tasks)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Productivity Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {summary.streakDays} {summary.streakDays === 1 ? 'day' : 'days'}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              🔥 Keep it going!
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            Consecutive daily completion streak.
          </p>
        </div>

        {/* Due Today & Overdue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Deadlines</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {summary.dueToday}
            </span>
            <span className="text-xs text-slate-500">due today</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            {summary.overdue > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                ⚠️ {summary.overdue} overdue {summary.overdue === 1 ? 'task' : 'tasks'}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ No overdue tasks
              </span>
            )}
          </p>
        </div>

        {/* Planned Focus Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Focus Hours</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {completedHours}h
            </span>
            <span className="text-xs text-slate-500">
              of {plannedHours}h done
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${summary.totalMinutes > 0 ? Math.min(100, Math.round((summary.completedMinutes / summary.totalMinutes) * 100)) : 0}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-brand-500" />
              <span>Category Distribution</span>
            </h3>
            <span className="text-xs text-slate-500">{categories.length} categories</span>
          </div>

          <div className="space-y-3">
            {categories.map(cat => {
              const catTotal = cat.count || 0;
              const catCompleted = cat.completed_count || 0;
              const pct = summary.total > 0 ? Math.round((catTotal / summary.total) * 100) : 0;

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      {cat.name}
                    </span>
                    <span className="text-slate-500">
                      {catCompleted}/{catTotal} completed ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: cat.color,
                        width: `${pct}%`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Priority Load</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['urgent', 'high', 'medium', 'low'].map(p => {
              const found = priorities.find(x => x.priority === p);
              const count = found ? found.count : 0;
              const config = {
                urgent: { label: 'Urgent', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-900/50' },
                high: { label: 'High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-900/50' },
                medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900/50' },
                low: { label: 'Low', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900/50' },
              }[p];

              return (
                <div key={p} className={`p-3 rounded-xl border ${config.border} ${config.bg} flex flex-col justify-between`}>
                  <span className={`text-xs font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
