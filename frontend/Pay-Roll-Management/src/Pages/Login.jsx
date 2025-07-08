import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../public/styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.password || !form.role) {
      setError('Please fill in all fields');
    } else {
      setError('');
      console.log('Login Form Data:', form);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error-msg">{error}</p>}

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="employee">Employee</option>
          <option value="finance">Finance</option>
        </select>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
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
