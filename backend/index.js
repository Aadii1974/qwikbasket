const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const { User, Product, Category, SubCategory } = require('./models');

const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Simple Health Check
app.get('/', (req, res) => res.send('🚀 Blinkit API is running...'));

// Database Connection & Server Start
const startServer = async () => {
  await connectDB();
  
  // Sync DB, altering schema cleanly
  await sequelize.sync({ alter: true }); 

  // Optional: Seed initial admin or products if table is empty
  const adminUser = await User.findOne({ where: { role: 'admin' } });
  if (!adminUser) {
     console.log('🌱 Seeding initial admin user...');
     const bcrypt = require('bcryptjs');
     await User.create({ 
       name: 'System Admin', 
       phone: 'admin', 
       password: await bcrypt.hash('admin', 10), 
       role: 'admin', 
       isApproved: true 
     });
  }

  const productCount = await Product.count();
  if (productCount === 0) {
     console.log('🌱 Seeding product catalog...');
     const products = [
       {
         name: 'Amul Taaza Toned Milk', unit: '1 L', category: 'dairy',
         b2cPrice: 56, b2bPrice: 52, minB2BQty: 10, stock: 250,
         images: JSON.stringify(['https://images.unsplash.com/photo-1550583726-22248229a10c?auto=format&fit=crop&q=80&w=400']),
         description: 'Fresh and pure toned milk from Amul.'
       },
       {
         name: 'Farm Fresh Tomatoes', unit: '1 kg', category: 'fruits-veg',
         b2cPrice: 40, b2bPrice: 32, minB2BQty: 25, stock: 500,
         images: JSON.stringify(['https://images.unsplash.com/photo-1582284728022-81ad57adc229?auto=format&fit=crop&q=80&w=400']),
         description: 'Juicy and organic tomatoes direct from farms.'
       }
     ];
     await Product.bulkCreate(products);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
