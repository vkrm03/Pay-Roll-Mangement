import React, { useState, useEffect } from 'react';
import '../../public/styles/settings.css';
import { toast } from 'react-toastify';

const Settings = ({ user }) => {
  const isAdmin = true;

  const [policy, setPolicy] = useState({
    payCycle: 'Monthly',
    bonusPercent: 10,
    taxCutoffDate: '20',
  });

  const [accessControl, setAccessControl] = useState({
    canCreatePayroll: true,
    canEditPayroll: true,
    canExport: true,
  });

  useEffect(() => {
  }, []);

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    setPolicy((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccessChange = (e) => {
    const { name, checked } = e.target;
    setAccessControl((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    toast.success("Settings updated successfully");
  };

  return (
    <div className="settings-container">
      <h2>⚙️ System Settings</h2>

      <div className="settings-section">
        <h3>📄 Payroll Policy Setup</h3>
        <label>
          Pay Cycle:
          <select name="payCycle" value={policy.payCycle} onChange={handlePolicyChange}>
            <option>Monthly</option>
            <option>Bi-Weekly</option>
            <option>Weekly</option>
          </select>
        </label>
        <label>
          Bonus Percentage:
          <input
            type="number"
            name="bonusPercent"
            value={policy.bonusPercent}
            onChange={handlePolicyChange}
            min="0"
            max="100"
          />
        </label>
        <label>
          Tax Cutoff Date:
          <input
            type="number"
            name="taxCutoffDate"
            value={policy.taxCutoffDate}
            onChange={handlePolicyChange}
            min="1"
            max="31"
          />
        </label>
      </div>

      {isAdmin && (
        <div className="settings-section">
          <h3>Access Control (Admin Only)</h3>
          <label>
            <input
              type="checkbox"
              name="canCreatePayroll"
              checked={accessControl.canCreatePayroll}
              onChange={handleAccessChange}
            />
            Allow Payroll Creation
          </label>
          <label>
            <input
              type="checkbox"
              name="canEditPayroll"
              checked={accessControl.canEditPayroll}
              onChange={handleAccessChange}
            />
            Allow Payroll Editing
          </label>
          <label>
            <input
              type="checkbox"
              name="canExport"
              checked={accessControl.canExport}
              onChange={handleAccessChange}
            />
            Allow Export
          </label>
        </div>
      )}

      <button className="save-btn" onClick={handleSubmit}>
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
