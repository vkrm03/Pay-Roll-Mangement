import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../public/api';
import { toast } from 'react-toastify';
import '../../public/styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      const res = await axios.post(`${api}login`, { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('u_id', res.data.u_id);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);
      window.dispatchEvent(new Event("userChanged"));
      const role = res.data.role.toLowerCase();
      toast.success('Login successful!');
      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'employee') {
        navigate('/user_dash');
      } else {
        toast.error('Unknown role. Contact support.');
  }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed');
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error-msg">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <p className="login-hint">
          <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
