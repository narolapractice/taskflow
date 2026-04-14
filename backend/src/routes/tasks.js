const express = require('express');
const Task    = require('../models/Task');
const Board   = require('../models/Board');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// POST /api/tasks — create task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, boardId, columnId, priority, dueDate, tags } = req.body;
    if (!title || !boardId || !columnId)
      return res.status(400).json({ success: false, message: 'title, boardId, columnId required' });

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });

    const count = await Task.countDocuments({ board: boardId, columnId });
    const task = await Task.create({
      title, description, board: boardId, columnId,
      priority: priority || 'medium',
      dueDate, tags, order: count,
      createdBy: req.user._id,
      status: columnId,
    });
    await task.populate('createdBy assignees', 'name email avatar');
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
});

// GET /api/tasks/:id — single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees createdBy', 'name email avatar')
      .populate('comments.user', 'name avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

// PUT /api/tasks/:id — update task
router.put('/:id', async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'columnId', 'priority', 'dueDate', 'tags', 'assignees', 'checklist', 'order', 'status'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('assignees createdBy', 'name email avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id — delete task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
});

// POST /api/tasks/:id/comments — add comment
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text required' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.comments.push({ user: req.user._id, text });
    await task.save();
    await task.populate('comments.user', 'name avatar');
    res.status(201).json({ success: true, comments: task.comments });
  } catch (err) { next(err); }
});

// PUT /api/tasks/:id/move — move task between columns
router.put('/:id/move', async (req, res, next) => {
  try {
    const { columnId, order } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id,
      { columnId, status: columnId, order },
      { new: true }
    ).populate('assignees createdBy', 'name email avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
});

module.exports = router;
