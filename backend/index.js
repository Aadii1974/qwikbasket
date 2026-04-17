const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
require('dotenv').config();

const authRoutes     = require('./routes/authRoutes');
const productRoutes  = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storeRoutes    = require('./routes/storeRoutes');
const addressRoutes  = require('./routes/addressRoutes');
const pincodeRoutes  = require('./routes/pincodeRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const couponRoutes   = require('./routes/couponRoutes');
const bannerRoutes   = require('./routes/bannerRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores',     storeRoutes);
app.use('/api/addresses',  addressRoutes);
app.use('/api/pincodes',   pincodeRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/settings',   settingsRoutes);
app.use('/api/delivery',   deliveryRoutes);
app.use('/api/coupons',    couponRoutes);
app.use('/api/banners',    bannerRoutes);




// Health Check
app.get('/', (req, res) => res.json({ status: 'ok', message: '🚀 QwikBasket API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Database Connection & Server Start
const startServer = async () => {

  try {
    await connectDB();

    // Prevent 'Too many keys specified' by disabling alter: true 
    await sequelize.sync();
    try {
      const seedBanners = require('./seedBanners');
      await seedBanners();
    } catch (e) {
      console.warn('Banner seeding skipped/failed');
    }


    app.listen(PORT, () => {
      console.log(`✅ QwikBasket API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
};

// --- Error Handlers ---
process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL: Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
