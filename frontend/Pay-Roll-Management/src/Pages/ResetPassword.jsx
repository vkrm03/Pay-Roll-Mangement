import React, { useState } from 'react';
import { useNavigate , useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../public/api';
import '../../public/styles/auth.css';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { autoClose: 2000 });
      return;
    }

    try {
      const res = await axios.post(`${api}reset-password/${token}`, { password });
      toast.success(res.data.msg || 'Password reset successfully', { autoClose: 2000 });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Something went wrong', { autoClose: 2000 });
      navigate('/forgot-password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
