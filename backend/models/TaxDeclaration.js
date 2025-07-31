const mongoose = require('mongoose');

const TaxDeclarationSchema = new mongoose.Schema({
  empId: { type: String, required: true },
  year: { type: Number, required: true },
  section80C: { type: Number, default: 0 },
  section80D: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  lta: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  rentPaid: { type: Number, default: 0 }
}, { timestamps: true });

TaxDeclarationSchema.index({ empId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('TaxDeclaration', TaxDeclarationSchema);
