require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

/* ===== FILE PATHS ===== */
const DATA_FILE = path.join(__dirname, "bookings.json");
const ADMINS_FILE = path.join(__dirname, "admins.json");
const JWT_SECRET = process.env.JWT_SECRET;

/* ===== SAFETY CHECK ===== */
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET not set in environment variables");
  process.exit(1);
}

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

/* ===== ENSURE FILES EXIST ===== */
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(ADMINS_FILE)) {
  // Default admin (CHANGE PASSWORD AFTER FIRST LOGIN)
  fs.writeFileSync(
    ADMINS_FILE,
    JSON.stringify(
      [
        {
          username: "admin",
          password: "Awais123",
          role: "superadmin"
        }
      ],
      null,
      2
    )
  );
}

/* ===== ADMIN LOGIN ===== */
app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const admins = JSON.parse(fs.readFileSync(ADMINS_FILE, "utf-8"));
  const admin = admins.find(
    a => a.username === username && a.password === password
  );

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username: admin.username, role: admin.role },
    JWT_SECRET,
    { expiresIn: "6h" }
  );

  res.json({ token });
});

/* ===== AUTH MIDDLEWARE ===== */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

/* ===== GET BOOKINGS (PROTECTED) ===== */
app.get("/api/bookings", authenticate, (req, res) => {
  const bookings = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  res.json(bookings);
});

/* ===== DELETE BOOKING (PROTECTED) ===== */
app.delete("/api/bookings/:index", authenticate, (req, res) => {
  const index = Number(req.params.index);
  const bookings = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  if (isNaN(index) || index < 0 || index >= bookings.length) {
    return res.status(400).json({ message: "Invalid booking index" });
  }

  bookings.splice(index, 1);
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));

  res.json({ message: "Booking deleted successfully" });
});

/* ===== SAVE BOOKING (PUBLIC) ===== */
app.post("/api/book-appointment", (req, res) => {
  const { name, phone, date } = req.body;

  if (!name || !phone || !date) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const bookings = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  bookings.push({
    name,
    phone,
    date,
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
  res.json({ message: "Booking saved successfully" });
});

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.send("✅ Hijama backend is running");
});

/* ===== START SERVER ===== */
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
