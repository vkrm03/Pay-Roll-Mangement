import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../public/styles/not_found.css';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {

      const timeout = setTimeout(() => {
        if (role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/user_dash');
        }
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
          navigate('/');
      }, 2000);
    }
  }, [navigate]);

  return (
    <div className="not-found">
      <img
        src="/imgs/404.png"
        alt="Page Not Found"
        className="not-found-image"
      />
      <h1>404</h1>
      <p>Oops! The page you’re looking for doesn’t exist.</p>
      <p>Redirecting you to Home...</p>
    </div>
  );
};

export default NotFound;
