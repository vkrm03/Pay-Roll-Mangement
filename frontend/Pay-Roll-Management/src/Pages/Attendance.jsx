import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../public/api';
import '../../public/styles/attendance.css'; // Only attendance styles now!

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchType, setSearchType] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [date]);

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

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${api}attendance?date=${date}`);
      const data = res.data.reduce((acc, att) => {
        acc[att.empId] = att.status;
        return acc;
      }, {});
      setAttendance(data);
    } catch (err) {
      toast.error('Failed to fetch attendance');
    }
  };

  const markAttendance = async (empId, status) => {
    try {
      await axios.post(`${api}attendance/mark`, { empId, date, status });
      setAttendance({ ...attendance, [empId]: status });
      toast.success(`Marked ${status} for ${empId}`);
    } catch (err) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return toast.error('Please select a CSV file');

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("date", date);

    try {
      await axios.post(`${api}attendance/bulk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Bulk attendance uploaded');
      fetchAttendance();
      setCsvFile(null);
    } catch (err) {
      toast.error('Bulk upload failed');
    }
  };

  const downloadAttendanceCSV = () => {
  const header = ['Emp ID', 'Name', 'Department', 'Status'];
  
  const rows = employees.map(emp => {
    return [
      emp.empId,
      emp.name,
      emp.department,
      attendance[emp.empId] || 'Not Marked'
    ];
  });

  const csvContent = [header, ...rows]
    .map(e => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance_${date}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};


  const filteredEmployees = employees
    .filter(emp => {
      const val = emp[searchType]?.toLowerCase();
      return val?.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortType === 'name') return a.name.localeCompare(b.name);
      if (sortType === 'status') {
        const statusA = attendance[a.empId] || 'Not Marked';
        const statusB = attendance[b.empId] || 'Not Marked';
        return statusA.localeCompare(statusB);
      }
      return 0;
    });

  return (
    <div className="attendance-page employees-container">
      <h2>Attendance Management</h2>

      <div className="search-controls">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="name">Name</option>
          <option value="empId">Employee ID</option>
          <option value="department">Department</option>
        </select>

        <input
          type="text"
          placeholder={`Search by ${searchType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="">Sort</option>
          <option value="name">Name (A-Z)</option>
          <option value="status">Status (Present/Absent)</option>
        </select>

        <button className="download-btn" onClick={downloadAttendanceCSV}>Download Attendance (.csv)</button>
      </div>

      <div className="bulk-import-section">
        <h4>Upload Attendance CSV</h4>

        <div
          className="drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type === "text/csv") {
              setCsvFile(file);
              toast.success(`Selected: ${file.name}`);
            } else {
              toast.error("Only CSV files allowed!");
            }
          }}
          onClick={() => document.getElementById('csv-upload').click()}
        >
          {csvFile ? (
            <p><strong>{csvFile.name}</strong> selected</p>
          ) : (
            <p>Drag & Drop CSV here or <span className="browse-link">Browse</span></p>
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
              toast.error("Only CSV files are allowed!");
            }
          }}
        />

        <button className="upload-btn" onClick={handleBulkUpload}>Upload CSV</button>

        <p className="csv-note">
          Only CSV files accepted. <a href="src/assets/attendance_sample.csv" download>Download Sample</a>
        </p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="employee-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Emp ID</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.empId}</td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`attendance-status ${attendance[emp.empId]?.toLowerCase() || 'not-marked'}`}>
                      {attendance[emp.empId] || 'Not Marked'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="attendance-btn present"
                      onClick={() => markAttendance(emp.empId, 'Present')}
                    >
                      Present
                    </button>
                    <button
                      className="attendance-btn absent"
                      onClick={() => markAttendance(emp.empId, 'Absent')}
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
