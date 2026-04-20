const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  title: String,
  category: String,
  department: String,
  location: { type: String, default: '' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  description: String,
  issueDate: { type: String, default: '' },
  priority: { type: String, default: 'normal' },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updates: { type: Array, default: [] },
  submittedBy: String  // stores user id
});

module.exports = mongoose.model('Grievance', grievanceSchema);