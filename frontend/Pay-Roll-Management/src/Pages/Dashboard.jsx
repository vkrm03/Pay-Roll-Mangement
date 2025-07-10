import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../public/styles/dashboard.css';

const Dashboard = () => {
  const payrollData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'June', 'June', 'June', 'June', 'June', 'June'],
    datasets: [
      {
        label: 'Net Pay',
        data: [1348504400, 1290000000, 1310000000, 1400000000, 1350000000],
        backgroundColor: '#ef4444',
      },
      {
        label: 'Taxes',
        data: [1515655510, 1480000000, 1520000000, 1490000000, 1500000000],
        backgroundColor: '#f97316',
      },
      {
        label: 'Statutories',
        data: [5016123, 6000000, 6200000, 5800000, 6100000],
        backgroundColor: '#facc15',
      },
      {
        label: 'Deductions',
        data: [296457680, 300000000, 310000000, 295000000, 305000000],
        backgroundColor: '#10b981',
      },
    ],
  };

  return (
    <div className="dashboard">

      <div className="payrun-banner">
        <p>Process Pay Run for May 2024 <span className="badge approved">APPROVED</span></p>
        <div className="payrun-info">
          <div><strong>Employees’ Net Pay</strong><p>₹17,25,23,654.00</p></div>
          <div><strong>Payment Date</strong><p>31 May 2024</p></div>
          <div><strong>No. of Employees</strong><p>1308</p></div>
          <button>View Details</button>
        </div>
      </div>

      <div className="kpi-cards">
        <div className="kpi-card">
          <h4>EPF</h4>
          <p>₹39,73,913.00</p>
          <a href="#">View Details</a>
        </div>
        <div className="kpi-card">
          <h4>ESI</h4>
          <p>₹91,010.00</p>
          <a href="#">View Details</a>
        </div>
        <div className="kpi-card">
          <h4>TDS Deduction</h4>
          <p>₹1,15,89,089.00</p>
          <a href="#">View Details</a>
        </div>
        <div className="kpi-card">
          <h4>Active Employees</h4>
          <p>1308</p>
          <a href="#">View Employees</a>
        </div>
      </div>

      <div className="tasks-section">
        <h3>To Do Tasks</h3>
        <ul>
          <li>136 Reimbursement Claim(s) <button>Approve</button></li>
          <li>96 Proof of Investment(s) <button>Approve</button></li>
          <li>55 Salary Revision(s) <button>Approve</button></li>
        </ul>
      </div>

      <div className="chart-section">
        <h3>Payroll Cost Summary</h3>
        <Bar data={payrollData} height={100} />
      </div>
    </div>
  );
};

export default Dashboard;
