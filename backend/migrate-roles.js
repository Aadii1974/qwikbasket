const { sequelize, User } = require('./models');
require('dotenv').config();

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');
    
    const [count] = await User.update(
      { role: 'delivery_agent' },
      { where: { role: 'delivery' } }
    );
    console.log(`✅ Migrated ${count} users from 'delivery' to 'delivery_agent'`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

migrate();
