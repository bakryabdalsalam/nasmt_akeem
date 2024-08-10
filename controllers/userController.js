const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "../data.json");

exports.getAllUsers = (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data" });
    }
    res.json(JSON.parse(data));
  });
};

exports.addUser = (req, res) => {
  const { name, phone, id, nationalities, customerService, prizeDraw } =
    req.body;

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
    const isDuplicate = users.some((user) => user.phone === phone);
    if (isDuplicate) {
      return res
        .status(400)
        .json({ error: "User with this mobile number already exists" });
    }
    users.push({ name, phone, id, nationalities, customerService, prizeDraw });
    fs.writeFile(dataFile, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save data" });
      }
      res.status(201).json(req.body);
    });
  });
};
