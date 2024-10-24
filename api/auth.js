export default function handler(req, res) {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  if (req.method === 'POST') {
    const { inputUsername, inputPassword } = req.body;

    if (inputUsername === username && inputPassword === password) {
      // Create a token (for simplicity, using a static token)
      const token = 'authenticated';
      return res.status(200).json({ message: 'Login successful', token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
