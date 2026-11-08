// =======================================================================
// CampusConnect API (Part 2)
// Express backend for the login page.
//
// Endpoints (fixed contract):
//   GET  /api/v1/health      -> 200 { status: "ok" }
//   POST /api/v1/sessions    -> 200 { token, user } | 400 | 401        (Member 1)
//   GET  /api/v1/users/me    -> 200 user | 401                          (Member 2)
// =======================================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---- Settings (come from server/.env, never typed here) ----------------
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy server/.env.example to server/.env and fill it in.");
  process.exit(1);
}

const app = express();

// ---- Middleware: CORS and JSON (must come BEFORE the routes) -----------
// CORS: only the front end address is allowed to call this API from a browser.
app.use(cors({ origin: CLIENT_ORIGIN }));
// JSON: makes req.body work.
app.use(express.json());

// ---- Demo users (a list in the code, no database) ----------------------
// Passwords are stored HASHED, never as plain text.
const users = [
  {
    id: 1,
    name: "Demo Student",
    email: "student@campusconnect.test",
    passwordHash: bcrypt.hashSync("Campus26", 10),
  },
];

// Used so an unknown email takes about as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

// Never send the password hash to the client.
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =======================================================================
// GET /api/v1/health
// =======================================================================
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// =======================================================================
// POST /api/v1/sessions   (log in)                     -- MEMBER 1
// =======================================================================
app.post("/api/v1/sessions", (req, res) => {
  const body = req.body || {};
  const { email, password } = body;

  // 1. Check the body: both must be text, and the email must look like an email.
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim() === "" ||
    password === "" ||
    !EMAIL_PATTERN.test(email.trim())
  ) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // 2. Find the user by email (lowercase first).
  const user = users.find((u) => u.email === email.trim().toLowerCase());

  // 3. Compare the typed password with the stored hash.
  const passwordOk = bcrypt.compareSync(password, user ? user.passwordHash : DUMMY_HASH);

  // 4. Unknown email OR wrong password: same 401 and same message.
  if (!user || !passwordOk) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // 5. Correct: make a token that expires in 1 hour.
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "1h" });
  return res.status(200).json({ token, user: publicUser(user) });
});

// =======================================================================
// Token check (middleware)                              -- MEMBER 2
// Reads:  Authorization: Bearer <token>
// =======================================================================
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Not logged in." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Not logged in." });
    }
    req.user = user;
    return next();
  } catch (err) {
    // Wrong, tampered or expired token.
    return res.status(401).json({ error: "Not logged in." });
  }
}

// =======================================================================
// GET /api/v1/users/me                                  -- MEMBER 2
// =======================================================================
app.get("/api/v1/users/me", requireAuth, (req, res) => {
  res.status(200).json(publicUser(req.user));
});

// =======================================================================
// 404 and 500 handlers (must be LAST)                   -- MEMBER 2
// =======================================================================
app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Badly formed JSON in the request body is the client's mistake.
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Email and password are required." });
  }
  // Log the real error on the server only. Never send stack traces to the client.
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
