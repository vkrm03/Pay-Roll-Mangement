import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../public/api';
import '../../public/styles/payroll.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', empId: '', email: '', phone: '', department: '', designation: '', joinDate: '', salary: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("");
  const [viewEmp, setViewEmp] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${api}employees`);
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (res.data.employees) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
  };

  const filteredEmployees = employees
    .filter(emp => emp[searchType]?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortType === "salary") return b.salary - a.salary;
      if (sortType === "name") return a.name.localeCompare(b.name);
      if (sortType === "joinDate") return new Date(b.joinDate) - new Date(a.joinDate);
      return 0;
    });

  const totalPages = Math.ceil(filteredEmployees.length / perPage);
  const displayed = filteredEmployees.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setForm({ name: '', empId: '', email: '', phone: '', department: '', designation: '', joinDate: '', salary: '' });
    setEditId(null);
    setCsvFile(null);
    setShowModal(true);
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (csvFile) {
      const formData = new FormData();
      formData.append("file", csvFile);

      try {
        await axios.post(`${api}employees/bulk`, formData);
        toast.success("Bulk import successful!");
        fetchEmployees();
        setShowModal(false);
      } catch (err) {
        toast.error("CSV Import failed!");
      }
      return;
    }

    const url = editId ? `${api}employees/update/${editId}` : `${api}employees/add`;
    const method = editId ? 'put' : 'post';

    try {
      await axios[method](url, form);
      toast.success(editId ? 'Updated!' : 'Added!');
      fetchEmployees();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to save employee');
    }
  };

  const handleExport = () => {
    const headers = ["Name", "ID", "Email", "Phone", "Dept", "Designation", "Join Date", "Salary"];
    const rows = employees.map(emp => [
      emp.name, emp.empId, emp.email, emp.phone, emp.department, emp.designation,
      new Date(emp.joinDate).toLocaleDateString(), emp.salary
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = "employees.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="employees-container">
      <h2>Employees Management</h2>

      <div className="controls">
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="name">Name</option>
          <option value="empId">ID</option>
          <option value="email">Email</option>
          <option value="department">Department</option>
        </select>

        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${searchType}`} />

        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="">Sort</option>
          <option value="name">Name</option>
          <option value="salary">Salary</option>
          <option value="joinDate">Join Date</option>
        </select>

        <button onClick={openAddModal}>+ Add</button>
        <button onClick={handleExport}>Export CSV</button>
        <button onClick={() => { setSearchTerm(""); setSortType(""); setCurrentPage(1); }}>Reset</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>ID</th><th>Email</th><th>Phone</th><th>Dept</th><th>Salary</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(emp => (
            <tr key={emp._id}>
              <td className="emp-name" onClick={() => setViewEmp(emp)}>{emp.name}</td>
              <td>{emp.empId}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.department}</td>
              <td>₹{emp.salary}</td>
              <td>
                <button onClick={() => { setForm(emp); setEditId(emp._id); setShowModal(true); }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
        <span>Page {currentPage}/{totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={handleAddOrUpdate}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
              <input name="empId" value={form.empId} onChange={handleChange} placeholder="ID" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
              <input name="department" value={form.department} onChange={handleChange} placeholder="Department" />
              <input name="designation" value={form.designation} onChange={handleChange} placeholder="Designation" />
              <input name="joinDate" type="date" value={form.joinDate} onChange={handleChange} />
              <input name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="Salary" />
              <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {viewEmp && (
        <div className="modal-backdrop" onClick={() => setViewEmp(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{viewEmp.name}'s Details</h3>
            <p><b>ID:</b> {viewEmp.empId}</p>
            <p><b>Email:</b> {viewEmp.email}</p>
            <p><b>Phone:</b> {viewEmp.phone}</p>
            <p><b>Department:</b> {viewEmp.department}</p>
            <p><b>Designation:</b> {viewEmp.designation}</p>
            <p><b>Join Date:</b> {new Date(viewEmp.joinDate).toLocaleDateString()}</p>
            <p><b>Salary:</b> ₹{viewEmp.salary}</p>
            <button onClick={() => setViewEmp(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
