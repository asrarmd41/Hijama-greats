/* ================= CONFIG ================= */
const BACKEND_URL = "https://hijama-backend.onrender.com"; // ✅ Render backend

let TOKEN = "";

/* ================= DOM ================= */
const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

/* ================= AUTO LOGIN (PERSIST SESSION) ================= */
const savedToken = localStorage.getItem("adminToken");
if (savedToken) {
  TOKEN = savedToken;
  loginScreen.style.display = "none";
  adminPanel.style.display = "block";
  loadBookings();
}

/* ================= LOGIN ================= */
loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value.trim();

  loginError.textContent = "";

  if (!username || !password) {
    loginError.textContent = "Enter username and password";
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      throw new Error("Invalid credentials");
    }

    TOKEN = data.token;
    localStorage.setItem("adminToken", TOKEN);

    loginScreen.style.display = "none";
    adminPanel.style.display = "block";

    loadBookings();
  } catch (err) {
    loginError.textContent = "❌ Invalid login";
  }
});

/* ================= LOAD BOOKINGS ================= */
async function loadBookings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error("Session expired");
    }

    const data = await res.json();
    const table = document.getElementById("bookingTable");
    table.innerHTML = "";

    if (!data.length) {
      table.innerHTML = `<tr><td colspan="6">No bookings yet</td></tr>`;
      return;
    }

    data.forEach((b, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${b.name}</td>
        <td>${b.phone}</td>
        <td>${b.date}</td>
        <td>${new Date(b.createdAt).toLocaleString()}</td>
        <td>
          <button onclick="deleteBooking(${i})"
            style="color:red;cursor:pointer;">
            Delete
          </button>
        </td>
      `;
      table.appendChild(tr);
    });
  } catch (err) {
    logout("Session expired. Please login again.");
  }
}

/* ================= DELETE BOOKING ================= */
async function deleteBooking(index) {
  if (!confirm("Are you sure you want to delete this booking?")) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/bookings/${index}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    loadBookings();
  } catch (err) {
    console.error("Delete error:", err);
    alert("❌ Delete failed");
  }
}

/* ================= LOGOUT ================= */
function logout(message) {
  localStorage.removeItem("adminToken");
  TOKEN = "";
  alert(message);
  location.reload();
}
