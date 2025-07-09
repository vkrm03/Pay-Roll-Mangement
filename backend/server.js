const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
.catch(err => console.log(err));



app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log(username);
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: "User already exists" });
  const hashedPwd = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPwd, role });
  await newUser.save();
  res.status(201).json({ msg: "User registered successfully" });
});


app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  const user = await User.findOne({ username, role });
  if (!user) return res.status(404).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  res.status(200).json({ token, username: user.username, role: user.role });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
