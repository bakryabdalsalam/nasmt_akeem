const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "../data.json");

exports.getAllUsers = (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data" });
    }

    let users = JSON.parse(data);

    // Optional: Filtering logic on the server side
    const { search, customerService, page = 1, limit = 10 } = req.query;

    if (search) {
      users = users.filter(user =>
        (user.name && user.name.includes(search)) ||
        (user.phone && user.phone.includes(search)) ||
        (user.id && user.id.includes(search)) ||
        (user.nationalities && user.nationalities.includes(search)) ||
        (user.number && user.number.toString().includes(search))
      );
    }

    if (customerService) {
      users = users.filter(user => user.customerService === customerService);
    }

    // Implement pagination for lazy loading
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      total: users.length,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      users: paginatedUsers
    });
  });
};

exports.addUser = (req, res) => {
  const { name, phone, id, nationalities, customerService, prizeDraw } = req.body;

  if (!name || !phone || !id || !nationalities || !customerService) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: "Phone number must be 10 digits" });
  }

  if (!/^\d{10}$/.test(id)) {
    return res.status(400).json({ error: "ID number must be 10 digits" });
  }

  fs.readFile(dataFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data" });
    }
    const users = JSON.parse(data);

    // Generate the next number based on the highest existing number
    let nextNumber = 1;
    if (users.length > 0) {
      const maxNumber = Math.max(...users.map(user => user.number || 0));
      nextNumber = maxNumber + 1;
    }

    const newUser = { name, phone, id, nationalities, customerService, prizeDraw, number: nextNumber };

    const isDuplicate = users.some((user) => user.phone === phone);
    if (isDuplicate) {
      return res
        .status(400)
        .json({ error: "User with this mobile number already exists" });
    }
    users.push(newUser);
    fs.writeFile(dataFile, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save data" });
      }
      res.status(201).json(newUser);
    });
  });
};
