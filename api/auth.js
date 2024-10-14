const express = require('express');
const router = express.Router();

const adminUsers = { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD };

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (adminUsers[username] === password) {
    req.session.authenticated = true;
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

module.exports = router;
