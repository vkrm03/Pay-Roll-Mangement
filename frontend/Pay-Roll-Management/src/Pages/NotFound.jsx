import React from 'react';
import { Link } from 'react-router-dom';
import '../../public/styles/not_found.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <img
        src="../public\imgs\404.png"
        alt="Payroll Illustration"
        className="not-found-image"
      />
      <h1>404</h1>
      <p>Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="home-button">Go to Home</Link>
    </div>
  );
};

export default NotFound;
