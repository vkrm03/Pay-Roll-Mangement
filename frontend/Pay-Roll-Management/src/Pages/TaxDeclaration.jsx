import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TaxDeclarationForm = ({ empId }) => {
  const year = new Date().getFullYear();
  const pdfRef = useRef();

  const [form, setForm] = useState({
    section80C: 0,
    section80D: 0,
    hra: 0,
    lta: 0,
    otherDeductions: 0,
    rentPaid: 0
  });

  const [tdsInfo, setTdsInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/tax/declaration/${empId}/${year}`)
      .then(res => setForm(res.data))
      .catch(() => console.log("No previous declaration"));
  }, [empId, year]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/tax/declaration', { empId, year, ...form });
      toast.success("Declaration Saved!");
    } catch (err) {
      toast.error("Failed to save declaration.");
    }
    setLoading(false);
  };

  const computeTDS = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/tax/compute/${empId}/${year}`);
      setTdsInfo(res.data);
    } catch (err) {
      toast.error("TDS computation failed");
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const input = pdfRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Form12BB_${empId}_${year}.pdf`);
  };

  return (
    <div className="tax-declaration-form" ref={pdfRef}>
      <h2>Form 12BB – Tax Declaration ({year})</h2>
      <form onSubmit={handleSubmit} className="tax-form">
        <div className="input-group">
          <label>Section 80C Investment</label>
          <input type="number" name="section80C" value={form.section80C} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Section 80D (Health Insurance)</label>
          <input type="number" name="section80D" value={form.section80D} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>HRA Exemption</label>
          <input type="number" name="hra" value={form.hra} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>LTA Claimed</label>
          <input type="number" name="lta" value={form.lta} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Other Deductions</label>
          <input type="number" name="otherDeductions" value={form.otherDeductions} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Rent Paid</label>
          <input type="number" name="rentPaid" value={form.rentPaid} onChange={handleChange} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Declaration"}
        </button>
      </form>

      <div className="action-buttons">
        <button onClick={computeTDS} disabled={loading}>
          {loading ? "Computing..." : "Compute TDS"}
        </button>
        <button onClick={downloadPDF}>Download Form 12BB (PDF)</button>
      </div>

      {tdsInfo && (
        <div className="tds-summary">
          <h3>TDS Summary</h3>
          <p><strong>Gross Income:</strong> ₹{tdsInfo.grossIncome}</p>
          <p><strong>Total Deductions:</strong> ₹{tdsInfo.deductionDeclared}</p>
          <p><strong>Taxable Income:</strong> ₹{tdsInfo.taxableIncome}</p>
          <p><strong>Total Tax:</strong> ₹{tdsInfo.totalTax}</p>
          <p><strong>Monthly TDS:</strong> ₹{tdsInfo.monthlyTDS}</p>
        </div>
      )}
    </div>
  );
};

export default TaxDeclarationForm;
