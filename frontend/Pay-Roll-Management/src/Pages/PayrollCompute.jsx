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
  const perPage = 5;

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(`${api}payroll`);
      setPayrolls(res.data);
    } catch (err) {
      toast.error('Failed to fetch payrolls');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const calculateGrossNet = () => {
    const basic = Number(form.basic) || 0;
    const allowance = Number(form.allowance) || 0;
    const deduction = Number(form.deduction) || 0;
    const gross = basic + allowance;
    const net = gross - deduction;

    setForm(prev => ({ ...prev, gross, net }));
  };

  const openAddModal = () => {
    setForm({ name: '', empId: '', basic: '', allowance: '', deduction: '', gross: '', net: '' });
    setEditId(null);
    setShowModal(true);
  };

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
      fetchPayrolls();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to save payroll');
    }
  };

  const filtered = payrolls.filter(p =>
    p[searchType]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const displayed = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleExport = () => {
    const headers = ["Name", "ID", "Basic", "Allowance", "Deduction", "Gross", "Net"];
    const rows = payrolls.map(p => [
      p.name, p.empId, p.basic, p.allowance, p.deduction, p.gross, p.net
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

      <div className="controls">
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="name">Name</option>
          <option value="empId">Employee ID</option>
        </select>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search by ${searchType}`}
        />

        <button onClick={openAddModal}>+ Compute Payroll</button>
        <button onClick={handleExport}>Export CSV</button>
        <button onClick={() => { setSearchTerm(""); setCurrentPage(1); }}>Reset</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>ID</th><th>Basic</th><th>Allowance</th><th>Deduction</th><th>Gross</th><th>Net</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayed.length > 0 ? displayed.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.empId}</td>
              <td>₹{p.basic}</td>
              <td>₹{p.allowance}</td>
              <td>₹{p.deduction}</td>
              <td>₹{p.gross}</td>
              <td>₹{p.net}</td>
              <td>
                <button onClick={() => { setForm(p); setEditId(p._id); setShowModal(true); }}>Edit</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="8" style={{ textAlign: 'center' }}>No records found</td></tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
        <span>Page {currentPage} / {totalPages || 1}</span>
        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Edit Payroll' : 'Compute Payroll'}</h3>

            <form onSubmit={handleAddOrUpdate}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
              <input name="empId" value={form.empId} onChange={handleChange} placeholder="Employee ID" required />
              <input name="basic" type="number" value={form.basic} onChange={handleChange} placeholder="Basic Salary" required />
              <input name="allowance" type="number" value={form.allowance} onChange={handleChange} placeholder="Allowance" required />
              <input name="deduction" type="number" value={form.deduction} onChange={handleChange} placeholder="Deduction" required />
              
              <button type="button" onClick={calculateGrossNet}>Calculate</button>

              <input name="gross" type="number" value={form.gross} readOnly placeholder="Gross Salary" />
              <input name="net" type="number" value={form.net} readOnly placeholder="Net Salary" />
              
              <div className="modal-actions">
                <button type="submit">{editId ? 'Update' : 'Save'}</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
