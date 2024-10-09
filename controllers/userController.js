const mongoose = require('mongoose');

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  id: String,
  nationalities: String,
  customerService: String,
  prizeDraw: Boolean,
  number: Number,
});

const User = mongoose.model('User', userSchema);

// Function to get all users with optional filtering
exports.getAllUsers = async (req, res) => {
  const { search, customerService, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { id: { $regex: search, $options: 'i' } },
      { nationalities: { $regex: search, $options: 'i' } },
      { number: parseInt(search, 10) },
    ];
  }

  if (customerService) {
    query.customerService = customerService;
  }

  try {
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      users,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve users" });
  }
};

// Function to add a new user
exports.addUser = async (req, res) => {
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

  try {
    const highestNumber = await User.findOne().sort('-number').exec();
    const nextNumber = highestNumber ? highestNumber.number + 1 : 1;

    const newUser = new User({
      name,
      phone,
      id,
      nationalities,
      customerService,
      prizeDraw,
      number: nextNumber,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to add user" });
  }
};
