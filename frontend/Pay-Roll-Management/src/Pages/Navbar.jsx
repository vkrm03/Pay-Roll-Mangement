import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../public/styles/navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const syncUser = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const adminFlag = localStorage.getItem('role') === "admin";
      setUser(token && username ? username : null);
      setIsAdmin(adminFlag);
    };

    syncUser();
    window.addEventListener('userChanged', syncUser);
    return () => window.removeEventListener('userChanged', syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("userChanged"));
    toast.success("Logged out successfully!");
    navigate('/');
  };

  const renderLinks = () => {
    if (!user) {
      return (
        <>
          <li><NavLink to="/home" onClick={toggleMenu}>Home</NavLink></li>
          <li><NavLink to="/" onClick={toggleMenu}>Login</NavLink></li>
        </>
      );
    }

    if (isAdmin) {
      return (
        <>
          <li><NavLink to="/dashboard" onClick={toggleMenu}>Dashboard</NavLink></li>
          <li><NavLink to="/employees" onClick={toggleMenu}>Employees</NavLink></li>
          <li><NavLink to="/attendance" onClick={toggleMenu}>Attendance</NavLink></li>
          <li><NavLink to="/payroll" onClick={toggleMenu}>Payroll</NavLink></li>
          <li><NavLink to="/admin_support" onClick={toggleMenu}>Support</NavLink></li>
          <li><NavLink to="/admin" onClick={toggleMenu}>Hi, Admin</NavLink></li>
          <li>
            <button className="logout-btn" onClick={() => { toggleMenu(); handleLogout(); }}>
              Logout
            </button>
          </li>
        </>
      );
    } else {
      return (
        <>
          <li><NavLink to="/user_dash" onClick={toggleMenu}>Dashboard</NavLink></li>
          <li><NavLink to="/user_attendance" onClick={toggleMenu}>My Attendance</NavLink></li>
          <li><NavLink to="/user_payroll" onClick={toggleMenu}>My Payslip</NavLink></li>
          <li><NavLink to="/user_support" onClick={toggleMenu}>Support</NavLink></li>
          <li><NavLink to="/user" onClick={toggleMenu}>Hi, {user?.split(' ')[0]}</NavLink></li>
          <li>
            <button className="logout-btn" onClick={() => { toggleMenu(); handleLogout(); }}>
              Logout
            </button>
          </li>
        </>
      );
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          PayRoll
        </NavLink>

        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
          {renderLinks()}
        </ul>

        <div className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? '✖' : '☰'}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
