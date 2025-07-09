import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../public/styles/navbar.css"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const syncUser = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      setUser(token && username ? username : null);
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          PayRoll
        </NavLink>

        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <li><NavLink to="/" onClick={toggleMenu}>Dashboard</NavLink></li>
          <li><NavLink to="/employees" onClick={toggleMenu}>Employees</NavLink></li>
          <li><NavLink to="/payroll" onClick={toggleMenu}>Payroll</NavLink></li>
          <li><NavLink to="/tax" onClick={toggleMenu}>Tax</NavLink></li>
          <li><NavLink to="/settings" onClick={toggleMenu}>Settings</NavLink></li>

          {user ? (
            <>
              <li>
                <NavLink to={localStorage.getItem('admin') === 'true' ? '/admin' : '/user'}>
                  Hi, {localStorage.getItem('admin') === 'true' ? 'Admin' : user.split(' ')[0]}
                </NavLink>
              </li>
              <li>
                <button className="logout-btn" onClick={() => { toggleMenu(); handleLogout(); }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><NavLink to="/register" onClick={toggleMenu}>Register</NavLink></li>
              <li><NavLink to="/login" onClick={toggleMenu}>Login</NavLink></li>
            </>
          )}
        </ul>

        <div className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? '✖' : '☰'}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
