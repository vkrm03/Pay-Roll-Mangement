  const express = require('express');
  const cors = require('cors');
  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const User = require('./models/User');
  const Employee = require('./models/Employee');
  const Attendance = require('./models/Attendance');
  const Payroll = require('./models/Payroll');
  const TaxDeclaration = require('./models/TaxDeclaration');
  const SupportTicket = require('./models/SupportTicket')
  const multer = require('multer');
  const csv = require('csv-parser');
  const fs = require('fs');
  const path = require('path');

  const app = express();
  const PORT = 5000;
  const JWT_SECRET = 'payroll_secret_token';
  const upload = multer({ dest: 'uploads/' });

  app.use(cors());
  app.use(express.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  mongoose.connect('mongodb://localhost:27017/payroll_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

  const getRoleFromDepartment = (department) => {
    if (!department) return 'Employee';
    if (department.toLowerCase() === 'hr') return 'Hr';
    return 'Employee';
  };



const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ msg: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Invalid token format' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: 'Invalid/Expired token' });
    req.user = decoded;
    next();
  });
};



app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ msg: 'Server error fetching user' });
  }
});

app.get('/api/attendance/user', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const employee = await Employee.findOne({ email: userEmail });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const records = await Attendance.find({ empId: employee.empId }).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
});

app.get('/api/attendance/user/summary', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    const employee = await Employee.findOne({ email: userEmail });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const records = await Attendance.find({ empId: employee.empId });
    
    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const percent = total ? Math.round((present / total) * 100) : 0;

    res.json({ total, present, absent, percent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error computing summary' });
  }
});


app.post('/api/support/ticket', authenticateToken, async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    
    const userEmail = req.user.email;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    const newTicket = new SupportTicket({ userEmail, subject, category, message });
    await newTicket.save();
    res.status(201).json({ message: 'Ticket submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/support/mytickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/adminsupport', authenticateToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });    
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching tickets' });
  }
});

app.put('/api/adminsupport/:id', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});




app.get('/api/payroll/user_summary', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const employee = await Employee.findOne({ email: user.email });
    if (!employee) {
      console.warn("No employee found for email:", user.email);
      return res.status(404).json({ message: 'Employee data not found' });
    }

    const payrolls = await Payroll.find({ empId: employee.empId }).sort({ createdAt: 1 });

    const history = payrolls.map(p => ({
      month: p.month,
      year: p.year,
      net: p.net,
      gross: p.gross,
      deduction: p.deduction
    }));

    res.status(200).json({
      employee: {
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        joinDate: employee.joinDate,
        salary: employee.salary
      },
      history
    });

  } catch (err) {
    console.error('Error fetching user payroll:', err);
    res.status(500).json({ message: 'Server error' });
  }
});





app.post('/api/update_user', authenticateToken, async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!email && !phone && !password) {
      return res.status(400).json({ msg: 'No fields to update' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const prevEmail = user.email;

    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    console.log("User updated:", user.email);

    const employee = await Employee.findOne({ email: prevEmail });
    if (employee) {
      if (email) employee.email = email;
      if (phone) employee.phone = phone;
      await employee.save();
      console.log("Employee updated:", employee.email);
    }

    res.status(200).json({ msg: 'User profile updated successfully' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ msg: 'Server error during profile update' });
  }
});





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
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ msg: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

      const token = jwt.sign(
  { id: user._id,role: user.role, email: user.email },
  JWT_SECRET,
  { expiresIn: '1d' }
);
      res.status(200).json({
        token,
        u_id: user._id,
        username: user.username,
        role: user.role
      });
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

    console.log(`Reset link sent to: ${email}`);
    res.status(200).json({ msg: 'Password reset link sent to your email' });
  });

  app.post('/api/employees/add', async (req, res) => {
    try {
      const { name, empId, email, phone, department, designation, joinDate, salary } = req.body;

      const role = getRoleFromDepartment(department);

      const newEmp = new Employee({
        name, empId, email, phone, department, designation, joinDate, salary, role
      });

      await newEmp.save();

      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        const hashedPwd = await bcrypt.hash(phone, 10);

        const newUser = new User({
          username: name,
          email,
          password: hashedPwd,
          role
        });

        await newUser.save();
      }

      res.status(201).json({ msg: "Employee & User created successfully", newEmp });

    } catch (err) {
      console.error("Add Employee error:", err);
      res.status(500).json({ msg: "Error adding employee" });
    }
  });

  app.post('/api/employees/bulk', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const results = [];
    const filePath = path.join(__dirname, req.file.path);

    try {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            name: data.name,
            empId: data.empId,
            email: data.email,
            phone: data.phone,
            department: data.department,
            designation: data.designation,
            joinDate: new Date(data.joinDate),
            salary: Number(data.salary),
            role: getRoleFromDepartment(data.department)
          });
        })
        .on('end', async () => {
          try {
            const existing = await Employee.find({ empId: { $in: results.map(emp => emp.empId) } });
            const existingIds = new Set(existing.map(emp => emp.empId));

            const duplicates = results.filter(emp => existingIds.has(emp.empId)).map(emp => emp.empId);
            const filteredResults = results.filter(emp => !existingIds.has(emp.empId));

            if (duplicates.length > 0) {
              fs.unlinkSync(filePath);
              return res.status(400).json({
                msg: "Duplicate Employee IDs found in CSV",
                duplicates,
              });
            }

            for (const emp of filteredResults) {
              await Employee.create(emp);

              const existingUser = await User.findOne({ email: emp.email });

              if (!existingUser) {
                const hashedPwd = await bcrypt.hash(emp.phone, 10);

                await User.create({
                  username: emp.name,
                  email: emp.email,
                  password: hashedPwd,
                  role: emp.role
                });
              }
            }

            fs.unlinkSync(filePath);
            res.status(201).json({ msg: "Employees & Users imported successfully" });

          } catch (err) {
            console.error("Bulk insert error:", err);
            res.status(500).json({ msg: "Error importing employees" });
          }
        });

    } catch (err) {
      console.error("CSV parsing error:", err);
      res.status(500).json({ msg: 'Error processing file' });
    }
  });

  app.post('/api/attendance/mark', async (req, res) => {
    const { empId, date, status } = req.body;

    if (!empId || !date || !status) {
      return res.status(400).json({ msg: "empId, date, and status are required" });
    }

    try {
      const existing = await Attendance.findOne({ empId, date });

      if (existing) {
        existing.status = status;
        await existing.save();
        return res.status(200).json({ msg: "Attendance updated" });
      }

      await Attendance.create({ empId, date, status });
      res.status(201).json({ msg: "Attendance marked" });

    } catch (err) {
      console.error("Mark Attendance Error:", err);
      res.status(500).json({ msg: "Error marking attendance" });
    }
  });

  app.get('/api/attendance', async (req, res) => {
    const { date } = req.query;

    if (!date) return res.status(400).json({ msg: "Date query param required" });

    try {
      const records = await Attendance.find({ date });
      res.status(200).json(records);
    } catch (err) {
      console.error("Fetch Attendance Error:", err);
      res.status(500).json({ msg: "Error fetching attendance" });
    }
  });

  app.post('/api/attendance/bulk', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const filePath = path.join(__dirname, req.file.path);
    const results = [];

    try {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.empId && data.status) {
            results.push({
              empId: data.empId,
              date: req.body.date,
              status: data.status
            });
          }
        })
        .on('end', async () => {
          try {
            for (const record of results) {
              const existing = await Attendance.findOne({ empId: record.empId, date: record.date });

              if (existing) {
                existing.status = record.status;
                await existing.save();
              } else {
                await Attendance.create(record);
              }
            }

            fs.unlinkSync(filePath);
            res.status(201).json({ msg: "Bulk attendance processed successfully" });

          } catch (err) {
            console.error("Bulk Attendance Error:", err);
            res.status(500).json({ msg: "Error processing bulk attendance" });
          }
        });

    } catch (err) {
      console.error("CSV Attendance Upload Error:", err);
      res.status(500).json({ msg: 'Error reading CSV file' });
    }
  });

  app.get('/api/employees', async (req, res) => {
    try {
      const all = await Employee.find();
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
      const emp = await Employee.findById(req.params.id);
      if (!emp) return res.status(404).json({ msg: "Employee not found" });

      await Employee.findByIdAndDelete(req.params.id);
      await User.findOneAndDelete({ email: emp.email });

      res.status(200).json({ msg: "Employee and user account deleted" });

    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ msg: "Error deleting employee" });
    }
  });



  app.get('/api/payroll', async (req, res) => {
    try {
      const data = await Payroll.find();
      res.status(200).json(data);
    } catch (err) {
      console.error("Get Payroll error:", err);
      res.status(500).json({ msg: "Error fetching payroll" });
    }
  });

app.post('/api/payroll/add', async (req, res) => {
  try {
    const { empId, basic, allowance, deduction, year, month } = req.body;

    const employee = await Employee.findOne({ empId });

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found with this ID" });
    }

    const gross = Number(basic) + Number(allowance);
    const net = gross - Number(deduction);

    const newPayroll = new Payroll({
      name: employee.name,
      empId: employee.empId,
      basic,
      allowance,
      deduction,
      gross,
      net,
      month,
      year
    });

    await newPayroll.save();

    employee.salary = net;
    await employee.save();

    res.status(201).json({ msg: "Payroll computed and employee salary updated", newPayroll });

  } catch (err) {
    console.error("Add Payroll error:", err);
    res.status(500).json({ msg: "Error computing payroll" });
  }
});


  app.put('/api/payroll/update/:id', async (req, res) => {
    try {
      const { basic, allowance, deduction } = req.body;

      const gross = Number(basic) + Number(allowance);
      const net = gross - Number(deduction);

      const updated = await Payroll.findByIdAndUpdate(req.params.id, {
        basic,
        allowance,
        deduction,
        gross,
        net
      }, { new: true });

      res.status(200).json({ msg: "Payroll updated", updated });

    } catch (err) {
      console.error("Update Payroll error:", err);
      res.status(500).json({ msg: "Error updating payroll" });
    }
  });


  app.delete('/api/payroll/delete/:id', async (req, res) => {
    try {
      await Payroll.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: "Payroll record deleted" });
    } catch (err) {
      console.error("Delete Payroll error:", err);
      res.status(500).json({ msg: "Error deleting payroll" });
    }
  });





app.get('/api/payroll/merged', async (req, res) => {
  try {
    const { year, month } = req.query;

    const employees = await Employee.find();

    const payrollFilter = {};
    if (year && month) {
      payrollFilter.year = parseInt(year);
      payrollFilter.month = month.padStart(2, '0');
    }

    const payrolls = await Payroll.find(payrollFilter);

    const payrollMap = {};
    payrolls.forEach(p => {
      payrollMap[p.empId] = p;
    });

    const merged = employees.map(emp => {
      const p = payrollMap[emp.empId];

      return {
        name: emp.name,
        empId: emp.empId,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        salary: emp.salary,
        joinDate: emp.joinDate,
        _id: p?._id || null,

        basic: p?.basic || null,
        allowance: p?.allowance || null,
        deduction: p?.deduction || null,
        gross: p?.gross || null,
        net: p?.net || null,
        month: p?.month || null,
        year: p?.year || null
      };
    });

    res.status(200).json(merged);

  } catch (err) {
    console.error("Merged Payroll error:", err);
    res.status(500).json({ msg: "Error merging payroll with employees" });
  }
});



app.post('/api/payroll/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  console.log("Payroll Bulk");

  const { month, year } = req.body;
  const filePath = path.join(__dirname, req.file.path);
  const results = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.empId) {
          const basic = Number(row.basic || 0);
          const allowance = Number(row.allowance || 0);
          const deduction = Number(row.deduction || 0);
          const gross = basic + allowance;
          const net = gross - deduction;

          results.push({ ...row, basic, allowance, deduction, gross, net });
        }
      })
      .on('end', async () => {
  for (const row of results) {
    const emp = await Employee.findOne({ empId: row.empId });
    if (!emp) continue;

    await Payroll.findOneAndUpdate(
      { empId: emp.empId, month, year },
      {
        name: emp.name,
        empId: emp.empId,
        basic: row.basic,
        allowance: row.allowance,
        deduction: row.deduction,
        gross: row.gross,
        net: row.net,
        month,
        year
      },
      { upsert: true, new: true }
    );

    emp.salary = row.net;
    await emp.save();
  }

  fs.unlinkSync(filePath);
  res.status(201).json({ msg: "Bulk payroll processed & salaries updated" });
});


  } catch (err) {
    console.error("Bulk Payroll Upload Error:", err);
    res.status(500).json({ msg: 'Server error during bulk upload' });
  }
});


app.get('/api/payroll/summary', async (req, res) => {
  try {
    const { year, month } = req.query;

    const filter = {};
    if (year) filter.year = parseInt(year);
    if (month) filter.month = month.padStart(2, '0');

    const payrolls = await Payroll.find(filter);
    const employees = await Employee.find();

    const monthlyTrend = await Payroll.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalGross: { $sum: "$gross" },
          totalNet: { $sum: "$net" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const avgCTCByDept = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          avgCTC: { $avg: "$salary" },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgCTC: -1 } }
    ]);

    const topCTCDept = avgCTCByDept[0] || {};

    const deductionCount = {};
    payrolls.forEach(p => {
      const rounded = Math.round(p.deduction / 100) * 100;
      deductionCount[rounded] = (deductionCount[rounded] || 0) + 1;
    });

    const sortedDeduction = Object.entries(deductionCount)
      .sort((a, b) => b[1] - a[1])
      .map(([amount, count]) => ({
        _id: `₹${amount}`,
        count,
        percent: ((count / payrolls.length) * 100).toFixed(1)
      }));

    const mostCommonDeduction = sortedDeduction[0] || {};

    const highestPaid = payrolls.reduce((max, p) =>
      p.net > (max?.net || 0) ? p : max,
      null
    );

    const departmentDistribution = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          percent: {
            $round: [
              { $multiply: [{ $divide: ["$count", employees.length] }, 100] },
              1
            ]
          }
        }
      }
    ]);

    const totalNet = payrolls.reduce((acc, p) => acc + p.net, 0);
    const totalDeduction = payrolls.reduce((acc, p) => acc + p.deduction, 0);

    res.status(200).json({
      monthlyTrend,
      avgCTCByDept,
      departmentDistribution,
      commonDeductions: sortedDeduction,
      mostCommonDeduction,
      topCTCDept,
      highestPaid,
      totalEmployees: employees.length,
      totalNet,
      totalDeduction
    });

  } catch (err) {
    console.error("Error in /api/payroll/summary:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post('/api/tax/declaration', async (req, res) => {
  try {
    const { empId, year, section80C, section80D, hra, lta, otherDeductions, rentPaid } = req.body;

    let decl = await TaxDeclaration.findOne({ empId, year });

    if (decl) {
      Object.assign(decl, { section80C, section80D, hra, lta, otherDeductions, rentPaid });
      await decl.save();
      return res.status(200).json({ msg: 'Declaration updated', data: decl });
    }

    decl = new TaxDeclaration({ empId, year, section80C, section80D, hra, lta, otherDeductions, rentPaid });
    await decl.save();
    res.status(201).json({ msg: 'Declaration saved', data: decl });

  } catch (err) {
    console.error("Declaration Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});


app.get('/api/tax/declaration/:empId/:year', async (req, res) => {
  try {
    const data = await TaxDeclaration.findOne({ empId: req.params.empId, year: parseInt(req.params.year) });
    if (!data) return res.status(404).json({ msg: "No declaration found" });
    res.status(200).json(data);
  } catch (err) {
    console.error("Fetch Declaration Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


app.get('/api/tax/compute/:empId/:year', async (req, res) => {
  try {
    const { empId, year } = req.params;

    const payrolls = await Payroll.find({ empId, year: parseInt(year) });
    const declaration = await TaxDeclaration.findOne({ empId, year: parseInt(year) });

    if (!payrolls.length) return res.status(404).json({ msg: "No payroll data found" });

    const grossIncome = payrolls.reduce((acc, p) => acc + (p.gross || 0), 0);
    const deductionDeclared = declaration
      ? (declaration.section80C + declaration.section80D + declaration.hra + declaration.lta + declaration.otherDeductions)
      : 0;

    const taxableIncome = Math.max(grossIncome - deductionDeclared, 0);

    let tax = 0;
    if (taxableIncome <= 250000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
    else if (taxableIncome <= 1000000)
      tax = (250000 * 0.05) + (taxableIncome - 500000) * 0.2;
    else
      tax = (250000 * 0.05) + (500000 * 0.2) + (taxableIncome - 1000000) * 0.3;

    const monthlyTDS = Math.round(tax / 12);

    res.status(200).json({
      grossIncome,
      deductionDeclared,
      taxableIncome,
      totalTax: Math.round(tax),
      monthlyTDS
    });

  } catch (err) {
    console.error("TDS Error:", err);
    res.status(500).json({ msg: "Error computing TDS" });
  }
});




  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
