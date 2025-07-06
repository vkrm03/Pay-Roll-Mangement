import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../public/styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError('Please fill in all fields');
    } else {
      setError('');
      console.log('Form Data:', form);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error-msg">{error}</p>}

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
          <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
