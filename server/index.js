const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'weathergpt_sih_secret';

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to SQLite database.");
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'citizen'
  )`);
});

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// --- ROUTES ---

// 1. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`);
    stmt.run([name, email, hashedPassword, role || 'citizen'], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      const token = jwt.sign({ id: this.lastID, name, role }, SECRET_KEY, { expiresIn: '24h' });
      res.status(201).json({ message: 'User created', token, user: { id: this.lastID, name, email, role } });
    });
    stmt.finalize();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// 3. User: Profile
app.get('/api/user/profile', authenticate, (req, res) => {
  db.get(`SELECT id, name, email, role FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`WeatherGPT Backend running on http://localhost:${PORT}`);
});
