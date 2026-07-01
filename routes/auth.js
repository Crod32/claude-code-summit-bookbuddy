const express = require('express');
const router = express.Router();

// Hard-coded demo user — no real auth, just for demonstration
const DEMO_USER = { username: 'admin', password: 'secret' };

// GET /login — show login form
router.get('/login', (req, res) => {
  res.json({ form: 'login', fields: ['username', 'password'] });
});

// POST /login — authenticate
router.post('/login', (req, res) => {
  const { username } = req.body;

  if (!req.body.password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }
  const password = req.body.password.trim();

  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    return res.json({ success: true, message: `Welcome, ${username}!` });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

module.exports = router;
