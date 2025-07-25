import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../public/api';
import '../../public/styles/employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: '',
    empId: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
    salary: ''
  });

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("");

  const filteredEmployees = employees
    .filter(emp => {
      const value = emp[searchType]?.toLowerCase();
      return value?.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortType === "salary") return b.salary - a.salary;
      if (sortType === "name") return a.name.localeCompare(b.name);
      if (sortType === "joinDate") return new Date(b.joinDate) - new Date(a.joinDate);
      return 0;
    });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api}employees`);
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setForm({
      name: '', empId: '', email: '', phone: '', department: '',
      designation: '', joinDate: '', salary: ''
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (csvFile) {
      const formData = new FormData();
      formData.append("file", csvFile);

      try {
        const res = await axios.post(`${api}employees/bulk`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Bulk employees imported!");
        fetchEmployees();
        setCsvFile(null);
        setShowModal(false);
      } catch (err) {
        if (err.response?.status === 400 && err.response.data.duplicates) {
          toast.error(`Duplicate empIds: ${err.response.data.duplicates.join(', ')}`);
        } else {
          toast.error("Bulk import failed");
        }
      }

      return;
    }

    const url = editId ? `${api}employees/update/${editId}` : `${api}employees/add`;
    const method = editId ? 'put' : 'post';

    try {
      await axios[method](url, form);
      toast.success(editId ? 'Employee updated!' : 'Employee added!');
      fetchEmployees();
      setShowModal(false);
      setEditId(null);
    } catch (err) {
      toast.error('Error saving employee');
    }
  };

  const handleEdit = (emp) => {
    setForm(emp);
    setEditId(emp._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      try {
        await axios.delete(`${api}employees/delete/${id}`);
        toast.success("Employee deleted");
        fetchEmployees();
      } catch (err) {
        toast.error("Failed to delete employee");
      }
    }
  };

  return (
    <div className="employees-container">
      <h2>Employee Management</h2>

      <div className="search-controls">
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="name">Name</option>
          <option value="empId">Employee ID</option>
          <option value="email">Email</option>
          <option value="department">Department</option>
          <option value="phone">Phone</option>
        </select>

        <input
          type="text"
          placeholder={`Search by ${searchType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="sort-select"
        >
          <option value="">Sort</option>
          <option value="name">Name (A - Z)</option>
          <option value="salary">Salary (High - Low)</option>
          <option value="joinDate">Join Date (Recent - Old)</option>
        </select>

        <button className="add-btn" onClick={openAddModal}>
          <i className="fa fa-plus"></i> Add Employee
        </button>
      </div>

      {/* 📋 Employees Table */}
      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <div className="employee-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Dept</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Salary</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.empId}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone || '-'}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.role}</td>
                  <td>{new Date(emp.joinDate).toLocaleDateString()}</td>
                  <td>₹{emp.salary}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(emp)}>
                      <i className="fa-solid fa-pencil"></i>
                    </button>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(emp._id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🧾 Modal Form */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editId ? 'Edit Employee' : 'Add New Employee'}</h3>

            <form className="employee-form" onSubmit={handleAddOrUpdate}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required={!csvFile} />
              <input name="empId" value={form.empId} onChange={handleChange} placeholder="Employee ID" required={!csvFile} />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required={!csvFile} />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required={!csvFile} />
              <input name="department" value={form.department} onChange={handleChange} placeholder="Department" required={!csvFile} />
              <input name="designation" value={form.designation} onChange={handleChange} placeholder="Designation" required={!csvFile} />
              <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} required={!csvFile} />
              <input name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="Salary" required={!csvFile} />

              {!editId && (
                <div className="bulk-import-section">
                  <h4>Employees Data Bulk Import (CSV)</h4>

                  <div
                    className="drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type === "text/csv") {
                        setCsvFile(file);
                        toast.success("CSV file selected");
                      } else {
                        toast.error("Only CSV files are allowed");
                      }
                    }}
                    onClick={() => document.getElementById('csv-upload').click()}
                  >
                    {csvFile ? (
                      <p style={{ marginTop: '8px', fontSize: '14px', color: '#1b3353' }}>
                        Selected: <strong>{csvFile.name}</strong>
                      </p>
                    ) : (
                      <p>
                        Drag & Drop CSV here or <span className="browse-link">Browse</span>
                      </p>
                    )}
                  </div>

                  <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type === "text/csv") {
                        setCsvFile(file);
                      } else {
                        toast.error("Only CSV files are allowed");
                      }
                    }}
                  />

                  <p className="csv-note">
                    Only CSV files accepted. <a href="src/assets/sample.csv" download>Download Sample</a>
                  </p>
                </div>
              )}

              <div className="modal-actions">
                <button type="submit">{editId ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
