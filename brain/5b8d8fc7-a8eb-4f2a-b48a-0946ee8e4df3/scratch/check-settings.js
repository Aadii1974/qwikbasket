const path = require('path');
const root = 'c:/Users/sneha/OneDrive/Desktop/my-ecommerce';
const { sequelize, Settings } = require(path.join(root, 'backend/models'));
require('dotenv').config({ path: path.join(root, 'backend/.env') });

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');
    
    const settings = await Settings.findByPk(1);
    console.log('⚙️ Settings:', JSON.stringify(settings, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

check();
