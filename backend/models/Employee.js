const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  department: { type: String },
  designation: { type: String },
  joinDate: { type: Date },
  salary: { type: Number },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
