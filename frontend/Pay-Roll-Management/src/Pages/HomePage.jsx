import React from "react";
import '../../public/styles/home.css';

const HomePage = () => {
  return (
    <div className="payroll-home">
      <section className="hero-banner">
        <h1 className="main-heading">Payroll Management System</h1>
        <p className="tagline">
          Smooth. Secure. Smarter Payroll for Everyone.
        </p>
      </section>
      
      <section className="flow-section">
        <h2>About Our Company</h2>
        <p>
          <strong>DataSkience (OPC) Private Limited</strong> – Driving payroll innovation with precision tax computation and seamless employee experiences.
        </p>
        <p>
          Chennai, India | ✉ <a href="mailto:admin@dataskience.in">admin@dataskience.in</a> | +91-9944317110
        </p>
      </section>

      <section className="features-row">
          <div className="feature">
            <h3>Employee Management</h3>
            <p>Maintain employee records, track attendance, and manage payroll effortlessly.</p>
          </div>
          <div className="feature">
            <h3>Payroll Computation</h3>
            <p>Automatic salary calculations with accurate deductions and Bulk Computation.</p>
          </div>
          <div className="feature">
            <h3>Tax Compliance</h3>
            <p>Generate TDS, PF, and ESI reports instantly, ensuring you meet all statutory requirements.</p>
          </div>
        </section>

      <footer className="footer-note">
        © {new Date().getFullYear()} DataSkience (OPC) Pvt. Ltd. | Payroll Made Easy
      </footer>
    </div>
  );
};

export default HomePage;
