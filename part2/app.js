const express = require('express');
const path = require('path');
require('dotenv').config();

const session = require('express-session');

const app = express();

app.use(session({
  secret: 'notyoursecret',
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// ✅ Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api', walkRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
