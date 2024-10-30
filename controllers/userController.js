const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  id: { type: String, unique: true },
  nationalities: String,
  customerService: String,
  number: Number,
  city: String,
  serviceType: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = async function handler(req, res) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    if (req.method === 'GET') {
      const {
        page = 1,
        limit = 50,
        customerService = '',
        search = '',
      } = req.query;

      // Build query conditions
      const queryConditions = {};
      if (customerService) {
        queryConditions.customerService = customerService;
      }
      if (search) {
        queryConditions.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } },
          { nationalities: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { serviceType: { $regex: search, $options: 'i' } },
          { number: Number(search) }, // Searching by number directly
        ];
      }

      // Calculate total users for pagination
      const total = await User.countDocuments(queryConditions);

      // Fetch users with pagination and sorting
      const users = await User.find(queryConditions)
        .sort({ number: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.json({ users, total });
    } else if (req.method === 'POST') {
      const { phone, id } = req.body;

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ phone }, { id }] });
      if (existingUser) {
        let errorMsg = 'يوجد مستخدم مسجل بهذا ';
        if (existingUser.phone === phone && existingUser.id === id) {
          errorMsg += 'رقم الجوال ورقم الهوية.';
        } else if (existingUser.phone === phone) {
          errorMsg += 'رقم الجوال.';
        } else if (existingUser.id === id) {
          errorMsg += 'رقم الهوية.';
        } else {
          errorMsg += 'رقم الجوال أو رقم الهوية.';
        }
        return res.status(400).json({ error: errorMsg });
      }

      // Get the highest number currently in the database
      const highestNumberUser = await User.findOne().sort('-number').exec();
      const newNumber =
        highestNumberUser && highestNumberUser.number
          ? highestNumberUser.number + 1
          : 1;

      const newUser = new User({
        ...req.body,
        number: newNumber,
      });
      await newUser.save();
      res.status(201).json(newUser);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({ error: `Duplicate ${field} detected.` });
    } else {
      res.status(500).json({ error: 'Database operation failed' });
    }
  }
};
