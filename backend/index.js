// WeatherGPT backend
//
// Read this file in this order:
// 1. Imports and server setup
// 2. CORS and JSON setup
// 3. SQLite database setup
// 4. Authentication helper
// 5. Weather and AI helper functions
// 6. API routes
// 7. Start server

// 1. IMPORTING LIBRARIES
// 'express' is the framework we use to create our web server and handle API requests (GET, POST, etc.)
const express = require('express');
// 'cors' allows our frontend (running on port 5173) to talk to our backend (running on port 5000) without security errors.
const cors = require('cors');
// 'bcryptjs' is used to securely encrypt (hash) user passwords before saving them in the database.
const bcrypt = require('bcryptjs');
// 'jsonwebtoken' (JWT) is used to create a secure digital ID card (token) when a user logs in, so they stay logged in.
const jwt = require('jsonwebtoken');
// 'sqlite3' is our lightweight database. '.verbose()' helps give detailed error messages if something goes wrong.
const sqlite3 = require('sqlite3').verbose();
// 'path' helps us safely locate files (like our database file) regardless of whether we are on Windows or Mac.
const path = require('path');

// 2. SERVER SETUP
// Initialize our express application
const app = express();
// Define the port our server will run on (default 5000)
const PORT = process.env.PORT || 5000;
// A secret password used by JWT to digitally sign the login tokens. Keep this secret!
const SECRET_KEY = 'weathergpt_sih_secret';

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Enable CORS so the React frontend can fetch data from this API
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked request from ${origin}`));
  },
  credentials: true
}));
// Tell Express to automatically understand and parse JSON data sent from the frontend
app.use(express.json());


// 3. DATABASE SETUP
// Define the exact location where we want to save our SQLite database file
const dbPath = path.resolve(__dirname, 'database.sqlite');
// Connect to the SQLite database (it will create the file if it doesn't exist yet)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to SQLite database successfully.");
  }
});

// Create our Database Tables (if they don't already exist)
db.serialize(() => {
  // We create a 'users' table to store user accounts
  // id: Unique number for each user (auto-increases)
  // name, email, password: User details
  // role: Default role is 'citizen', but could be 'admin' or 'farmer' later.
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'citizen'
  )`);
});


// 4. AUTHENTICATION MIDDLEWARE
// This is a "checkpoint" function. We attach it to private routes to make sure the user is actually logged in.
const authenticate = (req, res, next) => {
  // Look for the "Authorization" header sent by the frontend (it usually looks like "Bearer <token>")
  const token = req.headers.authorization?.split(' ')[1];
  
  // If no token is found, stop them and send a 401 Unauthorized error
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });
  
  try {
    // Verify the token using our SECRET_KEY. If it's valid, it decodes the user's ID and details.
    const decoded = jwt.verify(token, SECRET_KEY);
    // Attach the decoded user info to the request so the next function can use it
    req.user = decoded;
    // Tell Express to continue to the actual route handler
    next();
  } catch (err) {
    // If the token is fake or expired, send a 403 Forbidden error
    res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

// 5. HELPER FUNCTIONS
// These helpers keep the route code shorter and easier to understand.

const createFallbackReply = (query, language, location) => {
  const locale = (language || '').toLowerCase();
  const isHindi = locale.startsWith('hi') || /[\u0900-\u097F]/.test(query);
  const place = location || 'your area';

  if (isHindi) {
    return `${place} ke liye abhi live AI response available nahi hai, lekin weather check karte waqt temperature, humidity, wind aur rain probability par dhyan dein. Agar badal ghane hon, tez hawa chale, ya barish ka alert ho to travel aur kheti ka kaam plan karke karein. Accurate live forecast ke liye dashboard weather card aur official IMD/NCMRWF updates bhi check karein.`;
  }

  return `Live AI response is temporarily unavailable, but for ${place}, check temperature, humidity, wind speed, and rain probability before planning travel or farm work. If clouds are dense, winds are strong, or rain alerts appear, keep drainage and safety precautions ready. For the most accurate forecast, also check the dashboard weather card and official IMD/NCMRWF updates.`;
};

// Converts Open-Meteo weather codes plus thresholds into human-friendly labels.
const getWeatherCondition = (code, temp, windSpeed, rainProb) => {
  if (temp >= 42) return 'Severe Heat Wave';
  if (temp >= 37) return 'Heat Wave';
  if (windSpeed >= 50) return 'Damaging Winds';
  if (rainProb >= 80) return 'Very High Rain Probability';
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Heavy Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Stable Weather';
};

// Detects important hazards that should be shown to users.
const getWeatherRisk = ({ temp, humidity, windSpeed, rainProb, condition }) => {
  const hazards = [];

  if (condition.includes('Heat Wave')) hazards.push('heat wave');
  if (condition.includes('Fog')) hazards.push('fog');
  if (condition.includes('Thunderstorm')) hazards.push('thunderstorm');
  if (condition.includes('Rain') || rainProb >= 70) hazards.push('heavy rain');
  if (windSpeed >= 40) hazards.push('strong wind');
  if (humidity >= 85 && temp >= 32) hazards.push('humid heat stress');

  if (hazards.some(hazard => ['heat wave', 'thunderstorm', 'heavy rain', 'strong wind'].includes(hazard))) {
    return { level: 'High', hazards };
  }

  if (hazards.length > 0 || rainProb >= 45 || temp >= 35) {
    return { level: 'Moderate', hazards };
  }

  return { level: 'Low', hazards };
};

// Fetches live weather so the AI can answer using real local data.
const fetchWeatherContext = async ({ lat, lon, location }) => {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability,temperature_2m,weather_code,wind_speed_10m&forecast_days=2&timezone=Asia%2FKolkata`);

  if (!response.ok) {
    throw new Error(`Weather provider returned ${response.status}`);
  }

  const data = await response.json();
  const current = data.current || {};
  const rainProb = data.hourly?.precipitation_probability?.[0] ?? 0;
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = Math.round(current.wind_speed_10m);
  const condition = getWeatherCondition(current.weather_code, temp, windSpeed, rainProb);
  const risk = getWeatherRisk({ temp, humidity, windSpeed, rainProb, condition });

  return {
    location: location || 'your area',
    temp,
    feelsLike,
    humidity,
    windSpeed,
    rainProb,
    condition,
    riskLevel: risk.level,
    hazards: risk.hazards
  };
};

// Converts weather object into plain English for the AI system prompt.
const formatWeatherContext = (weather) => {
  if (!weather) return 'Live weather data is unavailable.';

  return `Live weather for ${weather.location}: ${weather.temp}°C, feels like ${weather.feelsLike}°C, humidity ${weather.humidity}%, wind ${weather.windSpeed} km/h, rain probability ${weather.rainProb}%, condition ${weather.condition}, risk ${weather.riskLevel}, hazards ${weather.hazards.join(', ') || 'none'}.`;
};


// 6. API ROUTES

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'WeatherGPT Backend',
    message: 'Backend is live. Use /api/health to check status and connect the frontend with VITE_API_URL.',
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login',
      register: '/api/auth/register',
      aiChat: '/api/ai/chat'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'WeatherGPT Backend',
    timestamp: new Date().toISOString()
  });
});

// --- REGISTER ROUTE (Create a new account) ---
app.post('/api/auth/register', async (req, res) => {
  // Get the name, email, and password typed by the user from the request body
  const { name, email, password, role } = req.body;
  
  // Check if they left any field blank
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Hash the password so it's not saved as plain text (security best practice)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare the SQL query to insert the new user into the database
    const stmt = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`);
    
    // Run the query with our variables
    stmt.run([name, email, hashedPassword, role || 'citizen'], function(err) {
      if (err) {
        // If the email is already registered, SQLite will throw a UNIQUE constraint error
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'An account with this email already exists' });
        }
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      // The user is successfully saved! Let's generate a Login Token for them so they are instantly logged in.
      const token = jwt.sign({ id: this.lastID, name, role }, SECRET_KEY, { expiresIn: '24h' });
      
      // Send the token and user details back to the React frontend
      res.status(201).json({ 
        message: 'User created successfully', 
        token, 
        user: { id: this.lastID, name, email, role } 
      });
    });
    stmt.finalize();
  } catch (error) {
    res.status(500).json({ error: 'Server error occurred' });
  }
});


// --- LOGIN ROUTE (Sign into an existing account) ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Search the database for a user with the provided email
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    // If no user is found with that email
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Compare the plain text password they typed with the hashed password saved in the DB
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    // If password is correct, generate a new Login Token valid for 24 hours
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    
    // Send success response back to frontend
    res.json({ 
      message: 'Login successful', 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  });
});


// --- GET USER PROFILE (Protected Route) ---
// Notice we added the 'authenticate' middleware here. Only logged-in users can access this!
app.get('/api/user/profile', authenticate, (req, res) => {
  // Use the ID from the verified token to look up the user's latest info in the DB
  db.get(`SELECT id, name, email, role FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const { query, language, location, lat, lon } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  let weather = null;
  try {
    weather = await fetchWeatherContext({ lat, lon, location });
  } catch (error) {
    console.error('Weather context error:', error);
  }

  try {
    const response = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are WeatherGPT, an advanced AI for weather forecasting, disaster alerts, climate information, farming guidance, and public safety. Reply in the user's language when possible. Detected language or locale: ${language || 'auto'}. User location: ${location || 'not provided'}. ${formatWeatherContext(weather)} Discuss relevant weather types such as rain, fog, heat wave, thunderstorm, wind, humidity, and crop safety when useful. Keep responses clear, practical, and under 4 sentences.`
          },
          { role: 'user', content: query }
        ],
        model: 'openai'
      })
    });

    if (!response.ok) {
      throw new Error(`AI provider returned ${response.status}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('AI provider returned an empty response');
    }

    res.json({ reply, weather });
  } catch (error) {
    console.error('AI chat error:', error);
    res.json({
      reply: createFallbackReply(query, language, location),
      weather,
      fallback: true
    });
  }
});


// 6. START THE SERVER
// Tell the server to start listening for requests on our defined PORT (5000)
app.listen(PORT, () => {
  console.log(`WeatherGPT Backend running on http://localhost:${PORT}`);
});
