import mongoose from 'mongoose';

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

export default async function handler(req, res) {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  if (req.method === 'GET') {
    const users = await User.find({});
    res.json(users);
  } else if (req.method === 'POST') {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
