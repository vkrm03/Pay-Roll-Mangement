const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  name: String,
  empId: String,
  basic: Number,
  allowance: Number,
  deduction: Number,
  gross: Number,
  net: Number,
  month: String,
  year: Number
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
