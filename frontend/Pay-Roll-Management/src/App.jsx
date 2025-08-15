import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "../public/styles/index.css"
import Navbar from './Pages/Navbar';
import Login from './Pages/Login';
import ForgotPassword from './Pages/ForgotPwd';
import ResetPassword from './Pages/ResetPassword';
import Dashboard from './Pages/Dashboard';
import Employees from './Pages/Employees';
import Attendance from './Pages/Attendance';
import PayrollCompute from './Pages/PayrollCompute';
import TaxDeclarationForm from './Pages/TaxDeclaration';
import User from './Pages/User';
import UserDash from './Pages/UserDash';
import UserAttendance from './Pages/UserAttendance';
import SupportPage from './Pages/Support';
import UserPayroll from './Pages/UserPayroll';
import AdminSupport from './Pages/AdminSupport';
import Admin from './Pages/Admin';
import NotFound from './Pages/NotFound';
import HomePage from './Pages/HomePage';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/tax" element={<TaxDeclarationForm />} />
        <Route path="/payroll" element={<PayrollCompute />} />
        <Route path="/admin_support" element={<AdminSupport />} />
        <Route path="/admin" element={<Admin />} />

        <Route path="/user_dash" element={<UserDash />} />
        <Route path="/user_attendance" element={<UserAttendance />} />
        <Route path="/user_support" element={<SupportPage  />} />
        <Route path="/user_payroll" element={<UserPayroll/>} />
        <Route path="/user" element={<User />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={true}/>
    </>
  );
};

export default App;
