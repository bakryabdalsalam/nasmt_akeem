const adminUsers = { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD };

// Function to handle login
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (adminUsers[username] === password) {
    req.session.authenticated = true; // Set session authenticated
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
};
