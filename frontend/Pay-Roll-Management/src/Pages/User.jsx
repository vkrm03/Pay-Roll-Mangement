import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../public/styles/user.css';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          email: res.data.email || '',
          phone: res.data.phone || '',
          password: '',
        });
      } catch (err) {
        toast.error('Failed to load user data');
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = new URLSearchParams(formData);

      await axios.post('/api/update_user', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update profile');
    }
  };

  return (
    <div className="user-profile-container">
      <h2>Update Your Profile, {localStorage.getItem('username')}</h2>

      <div className="user-info">
        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />

        <label>Phone</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />

        <label>New Password</label>
        <input
          type="password"
          name="password"
          placeholder="Leave blank if unchanged"
          value={formData.password}
          onChange={handleChange}
        />

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

export default UserProfile;
