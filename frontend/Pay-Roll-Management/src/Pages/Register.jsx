import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../public/api';
import { toast } from 'react-toastify';
import '../../public/styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const { username, email, password, confirmPassword, role } = form;

  if (!username || !email || !password || !confirmPassword || !role) {
    return setError('Please fill in all fields');
  }
  if (password !== confirmPassword) {
    return setError('Passwords do not match');
  }

  try {
    await axios.post(`${api}register`, { username, email, password, role });
    toast.success('Registered successfully!');
    navigate('/');
  } catch (err) {
    toast.error(err.response?.data?.msg || 'Something went wrong');
    setError(err.response?.data?.msg || 'Something went wrong');
  }
};


  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <p className="error-msg">{error}</p>}

        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
        </select>

        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />

        <button type="submit">Register</button>
        <p className="login-hint">
          Already have an account? <Link to="/" className="forgot-link">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
