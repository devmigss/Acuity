require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { requireAuth } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Public Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Acuity Node API is running' });
});

// Protected Route (Requires AWS Cognito Token)
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({
    message: 'You have successfully accessed a protected route!',
    user: req.user,
  });
});

app.listen(port, () => {
  console.log(`Node API server listening on port ${port}`);
});
