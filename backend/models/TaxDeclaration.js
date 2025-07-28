const mongoose = require('mongoose');

const TaxDeclarationSchema = new mongoose.Schema({
  empId: { type: String, required: true },
  year: { type: Number, required: true },
  section80C: { type: Number, default: 0 },       // Max 1.5L
  section80D: { type: Number, default: 0 },       // Health insurance
  hra: { type: Number, default: 0 },              // HRA claimed
  lta: { type: Number, default: 0 },              // Leave travel allowance
  otherDeductions: { type: Number, default: 0 },  // Any others
  rentPaid: { type: Number, default: 0 }          // For HRA computation if needed
}, { timestamps: true });

TaxDeclarationSchema.index({ empId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('TaxDeclaration', TaxDeclarationSchema);
