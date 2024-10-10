const mongoose = require('mongoose');
require('dotenv').config();
//فثسق
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  id: String,
  nationalities: String,
  customerService: String,
  prizeDraw: Boolean,
  number: Number,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = async function handler(req, res) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    if (req.method === 'GET') {
      const { page = 1, limit = 10, customerService = '', search = '' } = req.query;

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
      // Get the highest number currently in the database
      const highestNumberUser = await User.findOne().sort('-number').exec();
      const newNumber = highestNumberUser && highestNumberUser.number ? highestNumberUser.number + 1 : 1;

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
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
};
