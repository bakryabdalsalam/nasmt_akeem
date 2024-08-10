const adminUsers = { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD };

module.exports = function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    if (adminUsers[username] === password) {
      req.session.authenticated = true;
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
