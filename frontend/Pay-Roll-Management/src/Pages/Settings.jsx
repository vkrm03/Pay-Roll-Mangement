import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../public/styles/settings.css';
import { toast } from 'react-toastify';

const Settings = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState('policy');

  const [policy, setPolicy] = useState({
    workingHours: 8,
    leavePerMonth: 2,
    gracePeriod: 10,
    taxYearStart: '2025-04-01'
  });

  const [access, setAccess] = useState({
    canEditPayroll: false,
    canGeneratePayslip: false,
    canViewReports: true
  });

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings');
      setPolicy(data.policy || policy);
      setAccess(data.access || access);
    } catch (err) {
      console.log('No existing settings, using defaults');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    setPolicy(prev => ({ ...prev, [name]: value }));
  };

  const handleAccessChange = (e) => {
    const { name, checked } = e.target;
    setAccess(prev => ({ ...prev, [name]: checked }));
  };

  const saveSettings = async () => {
    try {
      await axios.post('/api/settings', { policy, access });
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings Panel</h2>

      <div className="settings-tabs">
        <button
          className={activeTab === 'policy' ? 'active' : ''}
          onClick={() => setActiveTab('policy')}
        >
          Policy Setup
        </button>
        {isAdmin && (
          <button
            className={activeTab === 'access' ? 'active' : ''}
            onClick={() => setActiveTab('access')}
          >
            Access Control
          </button>
        )}
      </div>

      {activeTab === 'policy' && (
        <div className="settings-form">
          <label>
            Working Hours/Day:
            <input
              type="number"
              name="workingHours"
              value={policy.workingHours}
              onChange={handlePolicyChange}
            />
          </label>
          <label>
            Monthly Leave Allowance:
            <input
              type="number"
              name="leavePerMonth"
              value={policy.leavePerMonth}
              onChange={handlePolicyChange}
            />
          </label>
          <label>
            Grace Period (Minutes):
            <input
              type="number"
              name="gracePeriod"
              value={policy.gracePeriod}
              onChange={handlePolicyChange}
            />
          </label>
          <label>
            Tax Year Start:
            <input
              type="date"
              name="taxYearStart"
              value={policy.taxYearStart}
              onChange={handlePolicyChange}
            />
          </label>
        </div>
      )}

      {activeTab === 'access' && isAdmin && (
        <div className="settings-form">
          <label>
            <input
              type="checkbox"
              name="canEditPayroll"
              checked={access.canEditPayroll}
              onChange={handleAccessChange}
            />
            Allow Payroll Editing
          </label>
          <label>
            <input
              type="checkbox"
              name="canGeneratePayslip"
              checked={access.canGeneratePayslip}
              onChange={handleAccessChange}
            />
            Allow Payslip Generation
          </label>
          <label>
            <input
              type="checkbox"
              name="canViewReports"
              checked={access.canViewReports}
              onChange={handleAccessChange}
            />
            Allow Report Access
          </label>
        </div>
      )}

      <button className="save-btn" onClick={saveSettings}>
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
