import { promises as fs } from 'fs';
import path from 'path';

const employeesFile = path.join(process.cwd(), 'employees.json');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(employeesFile, 'utf8');
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read employees data' });
    }
  } else if (req.method === 'POST') {
    const { employeeName } = req.body;
    if (!employeeName) {
      return res.status(400).json({ error: 'Employee name is required' });
    }

    try {
      const data = await fs.readFile(employeesFile, 'utf8');
      const employees = JSON.parse(data);
      const newEmployee = { id: Date.now(), name: employeeName };
      employees.push(newEmployee);
      await fs.writeFile(employeesFile, JSON.stringify(employees, null, 2));
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save employee' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
