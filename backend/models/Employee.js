const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String },
  department: { type: String },
  designation: { type: String },
  joinDate: { type: Date },
  salary: { type: Number },
  role: { type: String, default: 'Employee' }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
