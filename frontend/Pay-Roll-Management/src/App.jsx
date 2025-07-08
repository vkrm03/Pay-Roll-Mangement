import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "../public/styles/index.css"
import Navbar from './Pages/Navbar';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassword from './Pages/ForgotPwd';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
};

export default App;
