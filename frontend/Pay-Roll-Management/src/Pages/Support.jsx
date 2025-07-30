import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../public/styles/support.css';

const SupportPage = () => {
  const [calendar, setCalendar] = useState([]);
  const [ticket, setTicket] = useState({ subject: '', category: '', message: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
  axios.get('/api/calendar')
    .then(res => {
      if (Array.isArray(res.data)) {
        setCalendar(res.data);
      } else {
        console.warn('Expected array but got:', typeof res.data);
        setCalendar([]);
      }
    })
    .catch(err => {
      console.error('Calendar fetch error:', err);
      setCalendar([]);
    });
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/support/ticket', ticket, {
        headers: { Authorization: token }
      });
      setSuccessMsg('Ticket submitted successfully!');
      setTicket({ subject: '', category: '', message: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="support-container">
      <h2>Support Center</h2>

      <div className="contact-info">
        <h4>Contact Us</h4>
        <p>Email: Admin@admin.com</p>
        <p>Phone: +91 98765 43210</p>
        <p>Support Hours: Mon–Fri, 9 AM – 6 PM</p>
      </div>

      <div className="ticket-form">
        <h4>Raise a Ticket</h4>
        {successMsg && <p className="success">{successMsg}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Subject" required
            value={ticket.subject} onChange={e => setTicket({ ...ticket, subject: e.target.value })} />
          <select value={ticket.category} onChange={e => setTicket({ ...ticket, category: e.target.value })}>
            <option value="">Select Category</option>
            <option value="Payroll">Payroll</option>
            <option value="Tax">Tax</option>
            <option value="HR">HR</option>
            <option value="Other">Other</option>
          </select>
          <textarea rows="4" placeholder="Describe your issue..." required
            value={ticket.message} onChange={e => setTicket({ ...ticket, message: e.target.value })} />
          <button type="submit">Submit Ticket</button>
        </form>
      </div>

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
