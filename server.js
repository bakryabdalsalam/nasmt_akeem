const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;
const publicDir = path.join(__dirname, "public");

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(publicDir));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
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
