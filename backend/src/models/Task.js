const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  board:       { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  columnId:    { type: String, required: true },
  order:       { type: Number, default: 0 },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status:      { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
  assignees:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate:     { type: Date },
  tags:        [{ type: String, trim: true, maxlength: 30 }],
  checklist: [{
    text:      { type: String, required: true },
    completed: { type: Boolean, default: false },
  }],
  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:      { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

taskSchema.index({ board: 1, columnId: 1 });

module.exports = mongoose.model('Task', taskSchema);
