const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  color:       { type: String, default: '#6366f1' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  columns: [{
    _id:   { type: String, required: true },
    title: { type: String, required: true },
    color: { type: String, default: '#94a3b8' },
    order: { type: Number, default: 0 },
  }],
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

// Always include owner in members
boardSchema.pre('save', function (next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

module.exports = mongoose.model('Board', boardSchema);
