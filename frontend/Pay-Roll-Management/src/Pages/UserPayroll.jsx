import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../public/api";
import "../../public/styles/user_payroll.css";

const UserPayroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const empId = localStorage.getItem("u_id");

  const fetchPayroll = async () => {
    try {
      const res = await axios.get(`${api}payroll/user?usr_id=${empId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayrollData(res.data);
    } catch (error) {
      console.error("Payroll fetch error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (endpoint, filename) => {
    try {
      console.log(`${api}${endpoint}`);
      const res = await axios.get(`${api}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error: ", err);
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
                <h3>
                  {item.month}/{item.year}
                </h3>
                <div className="action-buttons">
                    <button
    className="download-btn"
    onClick={() =>
      handleDownload(
        `download-form16?userId=${empId}&month=${item.month}&year=${item.year}`,
        `Form16_${item.month}_${item.year}.pdf`
      )
    }
  >
    Download Form 16
  </button>

                </div>
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
