import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "../public/styles/index.css"
import Navbar from './Pages/Navbar';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassword from './Pages/ForgotPwd';
import Dashboard from './Pages/Dashboard';
import Employees from './Pages/Employees';
import Attendance from './Pages/Attendance';
import PayrollCompute from './Pages/PayrollCompute';
import TaxDeclarationForm from './Pages/TaxDeclaration';
import Settings from './Pages/Settings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/tax" element={<TaxDeclarationForm />} />
        <Route path="/payroll" element={<PayrollCompute />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={true}/>
    </>
  );
};

export default App;
