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

// Import Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');

// Protected Route (Requires AWS Cognito Token)
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({
    message: 'You have successfully accessed a protected route!',
    user: req.user,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

const { prisma } = require('./utils/db');

// Database Test Route
app.get('/api/db-test', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany();
    res.json({ status: 'ok', message: 'Successfully connected to PostgreSQL!', data: tenants });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Node API server listening on port ${port}`);
});
