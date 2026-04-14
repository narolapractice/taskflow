const express = require('express');
const Board   = require('../models/Board');
const Task    = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const DEFAULT_COLUMNS = [
  { _id: 'todo',        title: 'To Do',       color: '#64748b', order: 0 },
  { _id: 'in-progress', title: 'In Progress',  color: '#f59e0b', order: 1 },
  { _id: 'review',      title: 'In Review',    color: '#8b5cf6', order: 2 },
  { _id: 'done',        title: 'Done',         color: '#22c55e', order: 3 },
];

// GET /api/boards — all boards for current user
router.get('/', async (req, res, next) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
      isArchived: false,
    }).populate('owner', 'name email avatar').sort('-updatedAt');
    res.json({ success: true, count: boards.length, boards });
  } catch (err) { next(err); }
});

// POST /api/boards — create board
router.post('/', async (req, res, next) => {
  try {
    const { title, description, color } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Board title is required' });
    const board = await Board.create({
      title, description, color: color || '#6366f1',
      owner: req.user._id,
      columns: DEFAULT_COLUMNS,
    });
    await board.populate('owner', 'name email avatar');
    res.status(201).json({ success: true, board });
  } catch (err) { next(err); }
});

// GET /api/boards/:id — single board
router.get('/:id', async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id).populate('owner members', 'name email avatar');
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    const isMember = board.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, board });
  } catch (err) { next(err); }
});

// PUT /api/boards/:id — update board
router.put('/:id', async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    if (board.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only owner can edit this board' });
    const { title, description, color, columns } = req.body;
    if (title)       board.title = title;
    if (description !== undefined) board.description = description;
    if (color)       board.color = color;
    if (columns)     board.columns = columns;
    await board.save();
    res.json({ success: true, board });
  } catch (err) { next(err); }
});

// DELETE /api/boards/:id — delete board + its tasks
router.delete('/:id', async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    if (board.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only owner can delete this board' });
    await Task.deleteMany({ board: board._id });
    await board.deleteOne();
    res.json({ success: true, message: 'Board deleted' });
  } catch (err) { next(err); }
});

// GET /api/boards/:id/tasks — all tasks for a board
router.get('/:id/tasks', async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    const tasks = await Task.find({ board: req.params.id, isArchived: false })
      .populate('assignees createdBy', 'name email avatar')
      .sort('order');
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
});

module.exports = router;
