import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../public/styles/user_dashboard.css';
import { toast } from 'react-toastify';
import api from '../../public/api';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);


const UserDash = () => {
  const [userInfo, setUserInfo] = useState({});
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [userRes, payrollRes] = await Promise.all([
        axios.get(`${api}user`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${api}payroll/user_summary`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const emp = payrollRes.data.employee;
      setUserInfo({
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        joinDate: emp.joinDate,
        salary: emp.salary
      });

      setPayrollHistory(payrollRes.data.history || []);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateExperience = (joinDate) => {
    if (!joinDate) return 'N/A';
    const joined = new Date(joinDate);
    const now = new Date();
    const diff = now - joined;
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return `${years}y ${months}m`;
  };

  const lineData = {
    labels: payrollHistory.map(item => `${item.month}/${item.year}`),
    datasets: [
      {
        label: 'Net Pay (₹)',
        data: payrollHistory.map(item => item.net),
        fill: false,
        borderColor: '#4caf50',
        tension: 0.3
      },
      {
        label: 'Gross Pay (₹)',
        data: payrollHistory.map(item => item.gross),
        fill: false,
        borderColor: '#2196f3',
        tension: 0.3
      }
    ]
  };

  const barData = {
    labels: payrollHistory.map(item => `${item.month}/${item.year}`),
    datasets: [
      {
        label: 'Net Pay',
        data: payrollHistory.map(item => item.net),
        backgroundColor: '#4caf50'
      },
      {
        label: 'Deductions',
        data: payrollHistory.map(item => item.deduction),
        backgroundColor: '#f44336'
      }
    ]
  };

  const latest = payrollHistory.at(-1) || { net: 0, deduction: 0 };
  const pieData = {
    labels: ['Net Pay', 'Deductions'],
    datasets: [
      {
        data: [latest.net, latest.deduction],
        backgroundColor: ['#4caf50', '#f44336']
      }
    ]
  };

  if (loading) return <div className="dashboard-container"><h3>Loading your dashboard... ⏳</h3></div>;

  return (
    <div className="dashboard-container">
      <h2>Welcome, {userInfo?.name || 'User'} 👋</h2>

      <div className="stats-grid">
        <div className="stat-card"><h4>Email</h4><p>{userInfo.email || 'N/A'}</p></div>
        <div className="stat-card"><h4>Department</h4><p>{userInfo.department || 'N/A'}</p></div>
        <div className="stat-card"><h4>Designation</h4><p>{userInfo.designation || 'N/A'}</p></div>
        <div className="stat-card"><h4>Base Salary</h4><p>₹{userInfo.salary?.toLocaleString() || 'N/A'}</p></div>
        <div className="stat-card"><h4>Joining Date</h4><p>{userInfo.joinDate ? new Date(userInfo.joinDate).toDateString() : 'N/A'}</p></div>
        <div className="stat-card"><h4>Experience</h4><p>{calculateExperience(userInfo.joinDate)}</p></div>
        <div className="stat-card"><h4>Last Net Pay</h4><p>₹{payrollHistory.length > 0 ? Math.round(latest.net).toLocaleString() : 'N/A'}</p></div>
        <div className="stat-card"><h4>Total Deductions (YTD)</h4>
          <p>₹{payrollHistory.reduce((acc, cur) => acc + (cur.deduction || 0), 0).toLocaleString()}</p></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card-full">
          <h4>Monthly Salary Trend 📈</h4>
          {payrollHistory.length > 0 ? (
            <div style={{ height: '400px', width: '100%' }}><Line data={lineData} /></div>
          ) : <p>No payroll records found 🫠</p>}
        </div>

        <div className="chart-card">
          <h4>Pay vs Deduction (Monthly) 📊</h4>
          {payrollHistory.length > 0 ? (
            <div style={{ height: '300px' }}><Bar data={barData} /></div>
          ) : <p>No data to show</p>}
        </div>

        <div className="chart-card">
          <h4>Last Month Breakdown 🥧</h4>
          {payrollHistory.length > 0 ? (
            <div style={{ height: '300px' }}><Pie data={pieData} /></div>
          ) : <p>No data to show</p>}
        </div>
      </div>
    </div>
  );
};

export default UserDash;
