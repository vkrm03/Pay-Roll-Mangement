import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../public/api';
import '../../public/styles/user_payroll.css';

const UserPayroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    try {
      const token = localStorage.getItem('token');
      const u_id = localStorage.getItem('u_id');

      const res = await axios.get(`${api}payroll/user?usr_id=${u_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPayrollData(res.data);
    } catch (error) {
      console.error("Payroll fetch error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (month, year) => {
    const token = localStorage.getItem('token');
    const u_id = localStorage.getItem('u_id');

    axios.get(`${api}payroll/download?usr_id=${u_id}&month=${month}&year=${year}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', // Important for file downloads
    })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
    })
    .catch(err => console.error("Download error: ", err));
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  return (
    <div className="user-payroll-container">
      <h2 className="payroll-title">My Payslips</h2>
      {loading ? (
        <p className="loading">Loading your payroll data...</p>
      ) : payrollData.length === 0 ? (
        <p className="no-data">No payroll data found for you.</p>
      ) : (
        <div className="payroll-stack">
          {payrollData.map((item, idx) => (
            <div key={idx} className="payroll-card">
              <div className="card-header">
                <h3>{item.month}/{item.year}</h3>
                <button 
                  className="download-btn"
                  onClick={() => handleDownload(item.month, item.year)}
                >
                  Download
                </button>
              </div>
              <div className="card-body">
                <p><strong>Basic Pay:</strong> ₹{item.basic}</p>
                <p><strong>Allowance:</strong> ₹{item.allowance}</p>
                <p><strong>Deductions:</strong> ₹{item.deduction}</p>
                <p><strong>Gross Salary:</strong> ₹{item.gross}</p>
                <p><strong>Tax:</strong> ₹{item.tax || 0}</p>
                <p><strong>Net Salary:</strong> ₹{item.net}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPayroll;
