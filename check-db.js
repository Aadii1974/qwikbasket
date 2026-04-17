require('dotenv').config({ path: './backend/.env' });
const { Order, User, sequelize } = require('./backend/models');

async function checkData() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB Connected');
    
    const orders = await Order.findAll();
    console.log('📊 Total Orders in DB:', orders.length);
    if (orders.length > 0) {
      console.log('📝 First Order Details:', JSON.stringify(orders[0], null, 2));
    } else {
      console.log('⚠️ No orders found.');
    }
    
    const users = await User.findAll({ where: { role: 'b2b' } });
    console.log('📊 Total B2B Users in DB:', users.length);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkData();
