const express = require('express');
const User    = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/users — search users (for assigning tasks)
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = q
      ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
      : {};
    const users = await User.find(filter).select('name email avatar').limit(20);
    res.json({ success: true, users });
  } catch (err) { next(err); }
});

// GET /api/users/stats — dashboard stats for current user
router.get('/stats', async (req, res, next) => {
  try {
    const Task  = require('../models/Task');
    const Board = require('../models/Board');
    const [boards, totalTasks, doneTasks, highPriority] = await Promise.all([
      Board.countDocuments({ $or: [{ owner: req.user._id }, { members: req.user._id }], isArchived: false }),
      Task.countDocuments({ $or: [{ createdBy: req.user._id }, { assignees: req.user._id }], isArchived: false }),
      Task.countDocuments({ $or: [{ createdBy: req.user._id }, { assignees: req.user._id }], columnId: 'done' }),
      Task.countDocuments({ $or: [{ createdBy: req.user._id }, { assignees: req.user._id }], priority: { $in: ['high', 'urgent'] }, columnId: { $ne: 'done' } }),
    ]);
    res.json({ success: true, stats: { boards, totalTasks, doneTasks, highPriority } });
  } catch (err) { next(err); }
});

module.exports = router;
