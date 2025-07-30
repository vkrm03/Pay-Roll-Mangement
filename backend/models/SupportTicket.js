// models/SupportTicket.js
const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, enum: ['Payroll', 'Tax', 'HR', 'Other'], default: 'Other' },
  message: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
