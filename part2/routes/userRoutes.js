const express = require('express');
const router = express.Router();
const db = require('../models/db');
const xss = require('xss');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
const username = xss(req.body.username);
const email = xss(req.body.email);
const password = xss(req.body.password);
const role = xss(req.body.role);

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (completed version)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = rows[0];

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });

        // logout - ends session and returns success
    router.post('/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie('connect.sid'); // default session cookie name
        res.json({ message: 'Logged out' });
      });
    });

  }
});

// POST /api/users/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); // default cookie name
    res.json({ message: 'Logged out' });
  });
});

// GET sources current logged-in owner's dogs
router.get('/walks/mine', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const ownerId = req.session.user.user_id;

  try {
    const [dogs] = await db.query(
      'SELECT dog_id, name, size FROM Dogs WHERE owner_id = ?',
      [ownerId]
    );
    res.json(dogs);
  } catch (error) {
    console.error('Error fetching dogs for owner:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});
// GET all dogs (used on homepage)
router.get('/dogs', async (req, res) => {
  const db = require('../models/db');

  try {
    const [rows] = await db.query('SELECT * FROM Dogs');
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch dogs:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});



module.exports = router;