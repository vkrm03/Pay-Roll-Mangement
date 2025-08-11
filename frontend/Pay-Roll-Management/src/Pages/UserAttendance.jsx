import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../public/api';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import '../../public/styles/user_attendance.css';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const UserAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [filterMonth, setFilterMonth] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAttendance = async () => {
      try {
        const res = await axios.get(`${api}attendance/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecords(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setRecords([]);
      }
    };

    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${api}attendance/user/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSummary(res.data);
      } catch (err) {
        console.error('Error fetching summary:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserAttendance();
      fetchSummary();
    } else {
      console.warn('No token found!');
      setLoading(false);
    }
  }, [token]);

  const displayed = filterMonth
    ? records.filter(r => r.date.slice(0, 7) === filterMonth)
    : records;

  const lineData = {
    labels: displayed.map(r => r.date),
    datasets: [{
      label: 'Attendance',
      data: displayed.map(r => r.status === 'Present' ? 1 : 0),
      borderColor: '#2f80ed',
      backgroundColor: 'rgba(47,128,237,0.2)',
      tension: 0.4,
      fill: true,
      pointRadius: 5,
    }]
  };

  const pieData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [summary.present || 0, summary.absent || 0],
      backgroundColor: ['#6FCF97', '#EB5757']
    }]
  };

  return (
    <div className="user-attendance-container">
      <h2>Your Attendance Dashboard</h2>
      {loading ? <p>Loading...</p> : (
        <>
          <div className="summary-cards">
            <div className="card">
              <p>Total Days</p><strong>{summary.total}</strong>
            </div>
            <div className="card present">
              <p>Present</p><strong>{summary.present}</strong>
            </div>
            <div className="card absent">
              <p>Absent</p><strong>{summary.absent}</strong>
            </div>
            <div className="card percent">
              <p>Attendance %</p><strong>{summary.percent}%</strong>
            </div>
          </div>

          <div className="filters">
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
            />
            <button onClick={() => setFilterMonth('')}>Reset Filter</button>
          </div>

          <div className="chart-row">
            <div className="chart-box"><Line data={lineData} /></div>
            <div className="chart-box pie"><Pie data={pieData} /></div>
          </div>

          {displayed.length > 0 && (
            <div className="records-list">
              <h4>Daily Records</h4>
              <table>
                <thead>
                  <tr><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {displayed.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>
                        <span className={`attendance-badge ${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserAttendance;
