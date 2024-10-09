const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;
const publicDir = path.join(__dirname, "public");

const apiRoutes = require("./api/users");
const authRoutes = require("./api/auth");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(publicDir));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Middleware to check authentication for admin routes
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  } else {
    res.redirect("/login.html");
  }
}

// Employee data file
const employeesFile = path.join(__dirname, "employees.json");

// API to get employees
app.get("/api/employees", (req, res) => {
  fs.readFile(employeesFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read employees data" });
    }
    const employees = JSON.parse(data);
    res.json(employees);
  });
});

// API to add a new employee
app.post("/api/employees", (req, res) => {
  const { employeeName } = req.body;
  if (!employeeName) {
    return res.status(400).json({ error: "Employee name is required" });
  }

  fs.readFile(employeesFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read employees data" });
    }
    const employees = JSON.parse(data);
    const newEmployee = { id: Date.now(), name: employeeName };
    employees.push(newEmployee);

    fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save employee" });
      }
      res.status(201).json(newEmployee);
    });
  });
});

// API to delete an employee
app.delete("/api/employees/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(employeesFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read employees data" });
    }
    let employees = JSON.parse(data);
    employees = employees.filter(emp => emp.id != id);

    fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete employee" });
      }
      res.status(200).json({ message: "Employee deleted" });
    });
  });
});

app.use("/api", apiRoutes);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(publicDir, "login.html"));
});

app.get("/admin.html", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(publicDir, "admin.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
