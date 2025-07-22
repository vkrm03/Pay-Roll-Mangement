import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../public/styles/dashboard.css';
import api from '../../public/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalNet: 0,
    totalDeduction: 0,
    last5Payrolls: []
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${api}payroll/summary`);
      setSummary(res.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    }
  };

  const chartData = {
    labels: summary.last5Payrolls.map((p, idx) => `Payroll #${idx + 1}`),
    datasets: [
      {
        label: 'Net Pay',
        data: summary.last5Payrolls.map(p => p.net),
        backgroundColor: '#10b981',
      },
      {
        label: 'Deductions',
        data: summary.last5Payrolls.map(p => p.deduction),
        backgroundColor: '#ef4444',
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <h2>Payroll Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Employees</h4>
          <p>{summary.totalEmployees}</p>
        </div>

        <div className="stat-card">
          <h4>Total Net Paid</h4>
          <p>₹{summary.totalNet.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <h4>Total Deductions</h4>
          <p>₹{summary.totalDeduction.toLocaleString()}</p>
        </div>
      </div>

      <div className="chart-section">
        <h3>Last 5 Payroll Runs</h3>
        {summary.last5Payrolls.length > 0 ? (
          <Bar data={chartData} />
        ) : (
          <p>No payroll records yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
