import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from "../../public/api"
import '../../public/styles/support.css';

const SupportPage = () => {
  const [calendar, setCalendar] = useState([]);
  const [ticket, setTicket] = useState({ subject: '', category: 'Other', message: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  const token = localStorage.getItem('token');


  const fetchMyTickets = () => {
    axios.get(`${api}support/mytickets`, {
      headers: { Authorization: token }
    })
    .then(res => {
      if (Array.isArray(res.data)) {
        setMyTickets(res.data);
      } else {
        console.warn('Tickets API returned non-array:', res.data);
        setMyTickets([]);
      }
    })
    .catch(err => {
      console.error('Fetch tickets error:', err);
      setMyTickets([]);
    });
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await axios.post('/api/support/ticket', ticket, {
        headers: { Authorization: token }
      });
      setSuccessMsg('🎫 Ticket submitted successfully!');
      setTicket({ subject: '', category: 'Other', message: '' });
      fetchMyTickets();
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Failed to submit ticket. Try again later.');
    }
  };

  return (
    <div className="support-container">
      <h2>🛠️ Support Center</h2>

      {/* Contact Info */}
      <div className="contact-info">
        <h4>📞 Contact Us</h4>
        <p>Email: <a href="mailto:admin@admin.com">admin@admin.com</a></p>
        <p>Phone: +91 98765 43210</p>
        <p>Hours: Mon–Fri, 9 AM – 6 PM</p>
      </div>

      {/* Ticket Form */}
      <div className="ticket-form">
        <h4>✍️ Raise a Ticket</h4>
        {successMsg && <p className="success">{successMsg}</p>}
        {errorMsg && <p className="error">{errorMsg}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Subject"
            required
            value={ticket.subject}
            onChange={e => setTicket({ ...ticket, subject: e.target.value })}
          />
          <select
            required
            value={ticket.category}
            onChange={e => setTicket({ ...ticket, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Payroll">Payroll</option>
            <option value="Tax">Tax</option>
            <option value="HR">HR</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            rows="4"
            placeholder="Describe your issue..."
            required
            value={ticket.message}
            onChange={e => setTicket({ ...ticket, message: e.target.value })}
          />
          <button type="submit">🚀 Submit Ticket</button>
        </form>
      </div>

      {/* Ticket History */}
      <div className="ticket-history">
        <h4>📂 My Tickets</h4>
        {Array.isArray(myTickets) && myTickets.length === 0 ? (
          <p>No previous tickets found.</p>
        ) : (
          <ul>
            {myTickets.map((t, i) => (
              <li key={i} className="ticket-item">
                <div>
                  <strong>{new Date(t.createdAt).toLocaleDateString()}</strong> – 
                  <span className="ticket-subject">{t.subject}</span> 
                  <em className="ticket-category">({t.category})</em>
                </div>
                <span className={`ticket-status ${t.status.toLowerCase().replace(/\s/g, '-')}`}>
                  Status: {t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Calendar */}
      <div className="calendar-section">
        <h4>📅 Compliance Calendar</h4>
        <ul>
          {calendar.map((item, i) => (
            <li key={i}><strong>{item.date}</strong> – {item.task}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SupportPage;
