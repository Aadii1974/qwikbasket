const { sequelize, Order, User } = require('./models');
require('dotenv').config();

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');
    
    const orderCount = await Order.count();
    console.log('📦 Total Orders in DB:', orderCount);
    
    const b2bCount = await User.count({ where: { role: 'b2b' } });
    console.log('🤝 Total B2B Users:', b2bCount);
    
    const orders = await Order.findAll();
    console.log('Orders sample:', JSON.stringify(orders.slice(0, 2), null, 2));

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
    console.log('💰 Calculated Revenue:', totalRevenue);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

check();
