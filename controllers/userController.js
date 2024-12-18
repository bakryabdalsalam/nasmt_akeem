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
          { name: { $regex: search } },
          { phone: { $regex: search } },
          { id: { $regex: search } },
          { nationalities: { $regex: search } },
          { city: { $regex: search } },
          { serviceType: { $regex: search } },
        ];

        const searchNumber = Number(search);
        if (!isNaN(searchNumber)) {
          queryConditions.$or.push({ number: searchNumber });
        }
      }

      // Calculate total users for pagination with collation
      const total = await User.countDocuments(queryConditions).collation({ locale: 'ar', strength: 2 });

      // Fetch users with pagination, sorting, and collation
      const users = await User.find(queryConditions)
        .collation({ locale: 'ar', strength: 2 })
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
