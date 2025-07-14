const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  empId: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  status: { type: String, enum: ['Present', 'Absent'], required: true }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
