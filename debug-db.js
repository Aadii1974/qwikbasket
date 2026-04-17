const { sequelize, Order, User } = require('./backend/models');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');
    
    const orderCount = await Order.count();
    console.log('📦 Total Orders:', orderCount);
    
    const b2bCount = await User.count({ where: { role: 'b2b' } });
    console.log('🤝 Total B2B Users:', b2bCount);
    
    const orders = await Order.findAll();
    console.log('Orders data:', JSON.stringify(orders, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

check();
