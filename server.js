const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieSession = require('cookie-session');
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const apiRoutes = require("./api/users");
const authRoutes = require("./api/auth");

app.use(bodyParser.json());
app.use(express.static(publicDir));

// Configure cookie-session middleware
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Middleware to check authentication for admin routes
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  } else {
    res.redirect("/login.html");
  }
}

app.use("/api", apiRoutes);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(publicDir, "login.html"));
});

app.get("/admin.html", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(publicDir, "admin.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
