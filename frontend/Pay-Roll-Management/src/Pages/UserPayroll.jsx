import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../public/styles/user_payroll.css';

const UserPayroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('username');

      const res = await axios.get(`http://localhost:5000/api/payroll/user?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPayrollData(res.data);
    } catch (error) {
      console.error("Payroll fetch error: ", error);
    } finally {
      setLoading(false);
    }
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
                <h3>{item.month} {item.year}</h3>
                <span className="status-tag">{item.status}</span>
              </div>
              <div className="card-body">
                <p><strong>Basic Pay:</strong> ₹{item.basicPay}</p>
                <p><strong>HRA:</strong> ₹{item.hra}</p>
                <p><strong>Bonus:</strong> ₹{item.bonus}</p>
                <p><strong>Deductions:</strong> ₹{item.deductions}</p>
                <p><strong>Net Salary:</strong> ₹{item.netSalary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPayroll;
