// api/employees.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

module.exports = async function handler(req, res) {
  await mongoose.connect(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const employees = await Employee.find(); // Fetch all employees
      res.status(200).json(employees);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve employees" });
    }
  } else if (req.method === 'POST') {
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
  } else if (req.method === 'DELETE') {
    try {
      await Employee.findByIdAndDelete(req.query.id);
      res.status(200).json({ message: "Employee deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
