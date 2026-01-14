const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

const ADMIN_PASSWORD = "Awais123";
const DATA_FILE = path.join(__dirname, "bookings.json");

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

/* ===== ENSURE DATA FILE EXISTS ===== */
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

/* ===== ADMIN LOGIN ===== */
app.post("/api/admin-login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }

  res.status(401).json({ message: "Invalid password" });
});

/* ===== GET BOOKINGS ===== */
app.get("/api/bookings", (req, res) => {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  res.json(JSON.parse(data));
});

/* ===== DELETE BOOKING (🔥 THIS WAS MISSING / NOT ACTIVE) ===== */
app.delete("/api/bookings/:index", (req, res) => {
  const index = Number(req.params.index);

  console.log("DELETE index:", index); // 🔥 debug log

  const bookings = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  if (isNaN(index) || index < 0 || index >= bookings.length) {
    return res.status(400).json({ message: "Invalid booking index" });
  }

  bookings.splice(index, 1);
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));

  res.json({ message: "Booking deleted successfully" });
});

/* ===== SAVE BOOKING ===== */
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

/* ===== START SERVER ===== */
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
