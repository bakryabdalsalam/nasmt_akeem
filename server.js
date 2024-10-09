const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;
const publicDir = path.join(__dirname, "public");

const apiRoutes = require("./api/users");
const authRoutes = require("./api/auth");

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Failed to connect to MongoDB:", err));

// Define Employee Schema and Model
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Employee = mongoose.model("Employee", employeeSchema);

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

// API to get employees from MongoDB
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find(); // Fetch all employees
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve employees" });
  }
});

// API to add a new employee to MongoDB
app.post("/api/employees", async (req, res) => {
  const { employeeName } = req.body;
  if (!employeeName) {
    return res.status(400).json({ error: "Employee name is required" });
  }

  try {
    const newEmployee = new Employee({ name: employeeName });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(500).json({ error: "Failed to add employee" });
  }
});

// API to delete an employee from MongoDB
app.delete("/api/employees/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
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
