import React, { useState } from "react";
import "../../public/styles/admin.css";

const AdminUpdateProfile = () => {
  const [formData, setFormData] = useState({
    name: "Admin",
    email: "admin@example.com",
    password: "",
    confirmPassword: ""
  });

  const admin = {
    profilePic:
      "https://as1.ftcdn.net/jpg/01/12/09/12/1000_F_112091233_xghsriqmHzk4sq71lWBL4q0e7n9QJKX6.jpg"
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Updated Data:", formData);
    alert("Profile updated successfully!");
  };

  return (
    <div className="admin-update-profile">
      <h2>Update Profile</h2>

      <div className="profile-pic-container">
        <img
          src={admin.profilePic}
          alt="Admin"
          className="profile-pic-preview"
        />
      </div>

      <form onSubmit={handleSubmit}>
  <div className="form-column">
    <label>Name</label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      required
    />

    <label>Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-column">
    <label>Change Password</label>
    <input
      type="password"
      name="password"
      placeholder="Enter new password"
      value={formData.password}
      onChange={handleChange}
    />

    <label>Confirm Password</label>
    <input
      type="password"
      name="confirmPassword"
      placeholder="Confirm new password"
      value={formData.confirmPassword}
      onChange={handleChange}
    />
  </div>

  <button type="submit" className="update-btn">
    Update Profile
  </button>
</form>

    </div>
  );
};

export default AdminUpdateProfile;
