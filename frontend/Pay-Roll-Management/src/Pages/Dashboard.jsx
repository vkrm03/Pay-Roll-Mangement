import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../public/styles/dashboard.css';
import { toast } from 'react-toastify';
import api from '../../public/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  ArcElement, LineElement, PointElement,
  Tooltip, Legend
);

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [deptDistribution, setDeptDistribution] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${api}payroll/summary`);
      setSummary(res.data);
      setMonthlyTrend(res.data.monthlyTrend || []);
      setDeptDistribution(res.data.departmentDistribution || []);
    } catch (err) {
      toast.error('Failed to fetch dashboard summary');
    }
  };

  const barData = {
    labels: summary?.avgCTCByDept?.map(d => d._id),
    datasets: [
      {
        label: 'Avg CTC (₹)',
        data: summary?.avgCTCByDept?.map(d => Math.round(d.avgCTC)),
        backgroundColor: '#4caf50'
      }
    ]
  };

  const departmentPieData = {
    labels: deptDistribution.map(d => d._id),
    datasets: [
      {
        label: 'Department Share',
        data: deptDistribution.map(d => d.percent.toFixed(2)),
        backgroundColor: [
          '#1f77b4', '#ff7f0e', '#2ca02c',
          '#d62728', '#9467bd', '#8c564b', '#e377c2'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const lineData = {
    labels: monthlyTrend.map(m => `${m._id.month}/${m._id.year}`),
    datasets: [
      {
        label: 'Net Pay',
        data: monthlyTrend.map(m => m.totalNet),
        fill: false,
        borderColor: '#4caf50',
        tension: 0.3
      },
      {
        label: 'Gross Pay',
        data: monthlyTrend.map(m => m.totalGross),
        fill: false,
        borderColor: '#2196f3',
        tension: 0.3
      }
    ]
  };


  return (
    <div className="dashboard-container">
      <h2>Payroll Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Employees</h4>
          <p>{summary?.totalEmployees || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Total Net Paid</h4>
          <p>₹{Math.round(summary?.totalNet || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>Total Deductions</h4>
          <p>₹{Math.round(summary?.totalDeduction || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>Highest Paid (This Month)</h4>
          <p>{summary?.highestPaid?.name || 'N/A'} (₹{Math.round(summary?.highestPaid?.net || 0).toLocaleString()})</p>
        </div>
        <div className="stat-card"> 
          <h4>Top CTC Dept</h4>
          <p>{summary?.topCTCDept?._id || 'N/A'} (₹{Math.round(summary?.topCTCDept?.avgCTC || 0).toLocaleString()})</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4>Avg CTC by Department</h4>
          <Bar data={barData} />
        </div>

        <div className="chart-card">
          <h4>Dept. Distribution</h4>
          <Pie data={departmentPieData}/>
        </div>

        <div className="chart-card">
          <h4>Monthly Payroll Trend</h4>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
