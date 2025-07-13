import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../public/api';
import '../../public/styles/employees.css';
import '../../public/styles/attendance.css';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [date]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${api}employees`);
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to fetch employees');
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
    } catch (err) {
      toast.error('Bulk upload failed');
    }
  };

  return (
    <div className="employees-container">
      <h2>Attendance Management</h2>

      <div className="search-controls">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <div className="bulk-import-section">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
          />
          <button onClick={handleBulkUpload}>Upload CSV</button>
          <p className="csv-note">
            Only CSV files accepted. <a href="src/assets/attendance_sample.csv" download>Download Sample</a>
          </p>
        </div>
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
              {employees.map(emp => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.empId}</td>
                  <td>{emp.department}</td>
                  <td>
                    {attendance[emp.empId] === 'Present' ? (
                      <span style={{ color: 'green' }}>🟢 Present</span>
                    ) : attendance[emp.empId] === 'Absent' ? (
                      <span style={{ color: 'red' }}>🔴 Absent</span>
                    ) : (
                      <span style={{ color: '#888' }}>Not Marked</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="present-btn"
                      onClick={() => markAttendance(emp.empId, 'Present')}
                    >
                      Present
                    </button>
                    <button
                      className="absent-btn"
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
