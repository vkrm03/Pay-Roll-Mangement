import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../public/api';
import '../../public/styles/admin_support.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${api}adminsupport`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Unable to load tickets");
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.put(`${api}adminsupport/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Status updated");
      fetchTickets();
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="admin-support-container">
      <h2>Support Ticket Monitor</h2>

      {tickets.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No tickets to show.</p>
      ) : (
        <ul className="admin-ticket-list">
          {tickets.map((t) => (
            <li key={t._id} className="admin-ticket-item">
              <div className="ticket-main">
                <div>
                  <strong>{new Date(t.createdAt).toLocaleDateString()}</strong> – 
                  <span className="admin-ticket-subject">{t.subject}</span> 
                  <em className="admin-ticket-category">({t.category})</em>
                  <p className="admin-ticket-message">{t.message}</p>
                  <small className="admin-ticket-email">{t.userEmail}</small>
                </div>
                <div className="admin-ticket-status-right">
                  <label>Status:</label>
                  <select
                    value={t.status}
                    onChange={(e) => updateTicketStatus(t._id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminSupport;
