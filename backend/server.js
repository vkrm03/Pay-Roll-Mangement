  const express = require('express');
  const cors = require('cors');
  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const User = require('./models/User');
  const Employee = require('./models/Employee');
  const Attendance = require('./models/Attendance');
  const Payroll = require('./models/Payroll');
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

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

      res.status(200).json({
        token,
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

    console.log(`🔗 Reset link sent to: ${email}`);
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
      const { empId, basic, allowance, deduction } = req.body;

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
        net
      });

      await newPayroll.save();

      res.status(201).json({ msg: "Payroll computed successfully", newPayroll });

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
      const employees = await Employee.find();
      const payrolls = await Payroll.find();

      // Map payrolls by empId for quick lookup
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
          _id: p?._id || null,  // Use payroll ID if exists

          // Payroll Fields (null if not computed yet)
          basic: p?.basic || null,
          allowance: p?.allowance || null,
          deduction: p?.deduction || null,
          gross: p?.gross || null,
          net: p?.net || null
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

            await Payroll.create({
              name: emp.name,
              empId: emp.empId,
              basic: row.basic,
              allowance: row.allowance,
              deduction: row.deduction,
              gross: row.gross,
              net: row.net
            });
          }

          fs.unlinkSync(filePath);
          res.status(201).json({ msg: "Bulk payroll uploaded" });
        });
    } catch (err) {
      console.error("Bulk Payroll Upload Error:", err);
      res.status(500).json({ msg: 'Server error during bulk upload' });
    }
  });








app.get('/api/payroll/summary', async (req, res) => {
  try {
    const payrolls = await Payroll.find();
    const employees = await Employee.find();

    let totalNet = 0, totalDeduction = 0;

    payrolls.forEach(p => {
      totalNet += p.net || 0;
      totalDeduction += p.deduction || 0;
    });

    res.status(200).json({
      totalEmployees: employees.length,
      totalNet,
      totalDeduction,
      last5Payrolls: payrolls.slice(-5).reverse() // recent 5
    });

  } catch (err) {
    console.error("Payroll Summary error:", err);
    res.status(500).json({ msg: "Error fetching payroll summary" });
  }
});





  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
