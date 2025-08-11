import React, { useState } from "react";
import api from "../../public/api";
import "../../public/styles/admin.css";

const AdminUpdateProfile = () => {
  const [formData, setFormData] = useState({
    name: "Admin",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  const admin = {
    profilePic:
      "https://cdn.vectorstock.com/i/500p/94/35/admin-icon-isolated-on-white-background-vector-53099435.jpg"
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      alert("Email is required");
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${api}admin/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        alert(data.message);
        setFormData({ ...formData, password: "", confirmPassword: "" });
      } else {
        alert(data.message || "Error updating profile");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("Something went wrong");
    }
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

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-column">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value="Admin"
            readOnly
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

        <button type="submit" className="update-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default AdminUpdateProfile;
