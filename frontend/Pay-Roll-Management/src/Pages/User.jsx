import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../public/styles/user.css';
import { toast } from 'react-toastify';

const User = () => {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    theme: 'light',
    notifications: true,
  });

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
          password: '',
          theme: res.data.theme || 'light',
          notifications: res.data.notifications ?? true,
        });
      } catch (err) {
        toast.error('Failed to load user data');
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newVal }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();
      payload.append('username', formData.username);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('theme', formData.theme);
      payload.append('notifications', formData.notifications);
      if (profilePic) payload.append('profilePic', profilePic);

      await axios.put('/api/user/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="user-profile-container">
      <h2>My Profile</h2>


      <div className="user-info">
        <label>Username</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Enter new password"
          onChange={handleChange}
        />

        <label className="toggle-label">
          <input
            type="checkbox"
            name="notifications"
            checked={formData.notifications}
            onChange={handleChange}
          />
          Enable Notifications
        </label>

        <div className="user-actions">
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
          <button className="cancel-btn" onClick={() => window.location.reload()}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;
