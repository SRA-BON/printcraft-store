require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const extraOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...extraOrigins]);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      if (origin && /^https:\/\/[^\s]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((error) => console.error('❌ MongoDB Connection Error:', error));

// Import routes
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const sellersRouter = require('./routes/sellers');
const adminsRouter = require('./routes/admins');
const ordersRouter = require('./routes/orders');
const reportsRouter = require('./routes/reports');
const vouchersRouter = require('./routes/vouchers');
const chatRouter = require('./routes/chat');
const creationsRouter = require('./routes/creations');
const uploadRouter = require('./routes/upload');
const walletRouter = require('./routes/wallet');
const path = require('path');

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(
    express.static(clientBuildPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    })
  );
}

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/sellers', sellersRouter);
app.use('/api/admins', adminsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/chat', chatRouter);
app.use('/api/creations', creationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/wallet', walletRouter);
const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Rong-Tuli API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
