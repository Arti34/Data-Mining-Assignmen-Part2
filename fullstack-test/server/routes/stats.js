const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const total = db.prepare('SELECT COUNT(*) as count FROM todos').get().count;
    const completed = db.prepare("SELECT COUNT(*) as count FROM todos WHERE status = 'completed'").get().count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM todos WHERE status = 'in_progress'").get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM todos WHERE status = 'todo'").get().count;

    const overdue = db.prepare(`
      SELECT COUNT(*) as count FROM todos
      WHERE status != 'completed' AND due_date IS NOT NULL AND due_date < ?
    `).get(today).count;

    const dueToday = db.prepare(`
      SELECT COUNT(*) as count FROM todos
      WHERE status != 'completed' AND due_date = ?
    `).get(today).count;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priority breakdown
    const priorityStats = db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM todos
      GROUP BY priority
    `).all();

    // Category breakdown
    const categoryStats = db.prepare(`
      SELECT COALESCE(c.name, 'Uncategorized') as name,
             COALESCE(c.color, '#94a3b8') as color,
             COUNT(t.id) as count,
             SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM todos t
      LEFT JOIN categories c ON t.category_id = c.id
      GROUP BY c.id
    `).all();

    // Minutes breakdown
    const minutes = db.prepare(`
      SELECT
        COALESCE(SUM(estimated_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN estimated_minutes ELSE 0 END), 0) as completed_minutes
      FROM todos
    `).get();

    // Productivity streak (distinct completed days in the past 30 days)
    const completedDays = db.prepare(`
      SELECT DISTINCT SUBSTR(completed_at, 1, 10) as day
      FROM todos
      WHERE completed_at IS NOT NULL
      ORDER BY day DESC
      LIMIT 30
    `).all().map(r => r.day);

    let streak = 0;
    let checkDate = new Date();
    // Check if user completed something today or yesterday to start streak
    const checkDayStr = checkDate.toISOString().split('T')[0];
    const completedSet = new Set(completedDays);

    let currentDay = new Date();
    if (!completedSet.has(checkDayStr)) {
      // Check yesterday
      currentDay.setDate(currentDay.getDate() - 1);
    }

    while (completedSet.has(currentDay.toISOString().split('T')[0])) {
      streak++;
      currentDay.setDate(currentDay.getDate() - 1);
    }

    res.json({
      success: true,
      data: {
        summary: {
          total,
          completed,
          inProgress,
          pending,
          overdue,
          dueToday,
          completionRate,
          totalMinutes: minutes.total_minutes,
          completedMinutes: minutes.completed_minutes,
          streakDays: streak
        },
        priorities: priorityStats,
        categories: categoryStats
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
