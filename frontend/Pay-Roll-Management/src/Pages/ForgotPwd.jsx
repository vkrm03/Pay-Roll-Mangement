import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../public/api';
import '../../public/styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      await axios.post(`${api}forgot-password`, { email });
      toast.success('Password reset link sent!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleReset}>
        <h2>Reset Password</h2>

        {!submitted ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">Send Reset Link</button>

            <p className="login-hint">
              <Link to="/login" className="forgot-link">Back to Login</Link>
            </p>
          </>
        ) : (
          <>
            <p className="login-hint">
              A password reset link has been sent to your email !!
            </p>
            <p className="login-hint">
              <Link to="/login" className="forgot-link">Back to Login</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
