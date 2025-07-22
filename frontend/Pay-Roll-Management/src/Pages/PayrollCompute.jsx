import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../public/api';
import '../../public/styles/payroll.css';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [form, setForm] = useState({
    name: '', empId: '', basic: '', allowance: '', deduction: '', gross: '', net: ''
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkModal, setBulkModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [sortType, setSortType] = useState("");
  const perPage = 8;

  useEffect(() => {
    fetchMergedPayroll();
  }, []);

  const fetchMergedPayroll = async () => {
    try {
      const res = await axios.get(`${api}payroll/merged`);
      setPayrolls(res.data);
    } catch (err) {
      toast.error('Failed to fetch payrolls');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSampleDownload = () => {
  const headers = ["empId", "basic", "allowance", "deduction"];
  const sampleRows = [
    ["E101", "25000", "5000", "2000"],
    ["E102", "30000", "6000", "2500"]
  ];

  const csvContent = [headers, ...sampleRows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "sample_bulk_payroll.csv";
  link.click();
  URL.revokeObjectURL(url);
};


  const calculateGrossNet = () => {
    const basic = Number(form.basic) || 0;
    const allowance = Number(form.allowance) || 0;
    const deduction = Number(form.deduction) || 0;
    const gross = basic + allowance;
    const net = gross - deduction;

    setForm(prev => ({ ...prev, gross, net }));
  };

  const openBulkModal = () => setBulkModal(true);

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (!form.basic || !form.allowance || !form.deduction) {
      toast.error("Please fill in salary components and calculate first!");
      return;
    }

    const url = editId ? `${api}payroll/update/${editId}` : `${api}payroll/add`;
    const method = editId ? 'put' : 'post';

    try {
      await axios[method](url, form);
      toast.success(editId ? 'Payroll Updated!' : 'Payroll Added!');
      fetchMergedPayroll();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to save payroll');
    }
  };

  const handleBulkPayrollUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      await axios.post(`${api}payroll/bulk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Bulk payroll computed successfully");
      setBulkModal(false);
      fetchMergedPayroll();
    } catch (err) {
      toast.error("Error uploading bulk payroll");
    }
  };

  // ===== Filtering & Sorting Logic =====
  const filtered = payrolls.filter(p =>
    p[searchType]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered];

  if (sortType === "name-asc") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === "name-desc") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortType === "net-desc") {
    sorted.sort((a, b) => (b.net || 0) - (a.net || 0));
  } else if (sortType === "net-asc") {
    sorted.sort((a, b) => (a.net || 0) - (b.net || 0));
  }

  const totalPages = Math.ceil(sorted.length / perPage);
  const displayed = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ===== CSV Export =====
  const handleExport = () => {
    const headers = ["Name", "ID", "Basic", "Allowance", "Deduction", "Gross", "Net"];
    const rows = payrolls.map(p => [
      p.name, p.empId, p.basic || "", p.allowance || "", p.deduction || "", p.gross || "", p.net || ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "payroll.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="payroll-container">
      <h2>Payroll Computation</h2>

      <div className="payroll-controls">
        <select value={sortType} onChange={(e) => { setSortType(e.target.value); setCurrentPage(1); }} className="sort-dropdown">
          <option value="">Sort By</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="net-desc">Net Salary (High to Low)</option>
          <option value="net-asc">Net Salary (Low to High)</option>
        </select>

        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="name">Name</option>
          <option value="empId">Employee ID</option>
        </select>

        <input
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          placeholder={`Search by ${searchType}`}
        />

        <button className="compute-btn" onClick={openBulkModal}>Compute Bulk Payroll</button>
        <button className="export-btn" onClick={handleExport}>Export CSV</button>
      </div>

      <table className="payroll-table">
        <thead>
          <tr>
            <th>Name</th><th>ID</th><th>Basic</th><th>Allowance</th><th>Deduction</th><th>Gross</th><th>Net</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((emp) => (
            <tr key={emp.empId}>
              <td>{emp.name}</td>
              <td>{emp.empId}</td>
              <td>{emp.basic ? `₹${emp.basic}` : '—'}</td>
              <td>{emp.allowance ? `₹${emp.allowance}` : '—'}</td>
              <td>{emp.deduction ? `₹${emp.deduction}` : '—'}</td>
              <td>{emp.gross ? `₹${emp.gross}` : '—'}</td>
              <td>{emp.net ? `₹${emp.net}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="payroll-pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
        <span>Page {currentPage} / {totalPages || 1}</span>
        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
      </div>

{bulkModal && (
  <div className="bulk-modal-backdrop" onClick={() => setBulkModal(false)}>
    <div className="bulk-modal" onClick={e => e.stopPropagation()}>
      <h3>Bulk Payroll Computation</h3>
      <p>
  Upload CSV: <b>empId, basic, allowance, deduction</b> 
  &nbsp; 
  <span 
    onClick={handleSampleDownload} 
    style={{ 
      color: "#2F80ED", 
      textDecoration: "underline", 
      cursor: "pointer", 
      marginLeft: "10px" 
    }}
  >Download Sample </span>
</p>


      <div
        className="bulk-drag-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && file.name.endsWith(".csv")) {
            setCsvFile(file);
            toast.success(`Selected: ${file.name}`);
          } else {
            toast.error("Only CSV files are allowed");
          }
        }}
        onClick={() => document.getElementById('csv-upload-payroll').click()}
      >
        <p>{csvFile ? <span className="bulk-file-name">{csvFile.name}</span> : "Drag & Drop CSV here or Click to Browse"}</p>
      </div>

      <input
        type="file"
        id="csv-upload-payroll"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file && file.name.endsWith(".csv")) {
            setCsvFile(file);
          } else {
            toast.error("Only CSV files are allowed");
          }
        }}
      />

      <div className="bulk-modal-actions">
        <button className="upload-btn" onClick={handleBulkPayrollUpload}>Upload</button>
        <button className="cancel-btn" onClick={() => setBulkModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Payroll;
