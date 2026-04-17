const { sequelize, User } = require('./models');
require('dotenv').config();

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');
    
    // We can't use User.findAll if the sync fails, but we can use raw query
    const [results] = await sequelize.query("SELECT id, name, role FROM Users");
    console.log('👥 Users found:', results.length);
    results.forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Role: ${u.role}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

check();
