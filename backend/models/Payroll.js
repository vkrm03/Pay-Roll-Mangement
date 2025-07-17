const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  name: String,
  empId: String,
  basic: Number,
  allowance: Number,
  deduction: Number,
  gross: Number,
  net: Number
});

module.exports = mongoose.model('Payroll', payrollSchema);
