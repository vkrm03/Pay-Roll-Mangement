const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Employee = require('./models/Employee');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'payroll_secret_token';

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/payroll_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));


app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPwd, role });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error during registration" });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.findOne({ username, role });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ msg: 'User with this email does not exist' });
  }

  console.log(`🔗 Reset link sent to: ${email}`);
  res.status(200).json({ msg: 'Password reset link sent to your email' });
});

app.post('/api/employees/add', async (req, res) => {
  try {
    const newEmp = new Employee(req.body);
    await newEmp.save();
    res.status(201).json({ msg: "Employee added", newEmp });
  } catch (err) {
    console.error("Add Employee error:", err);
    res.status(500).json({ msg: "Error adding employee" });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const all = await Employee.find();
    console.log("get works form employees");    
    res.status(200).json(all);
  } catch (err) {
    console.error("Get Employees error:", err);
    res.status(500).json({ msg: "Error fetching employees" });
  }
});

app.put('/api/employees/update/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ msg: "Employee updated", updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Error updating employee" });
  }
});

app.delete('/api/employees/delete/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Employee deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Error deleting employee" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
