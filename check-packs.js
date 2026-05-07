require('dotenv').config({ path: './backend/.env' });
const { ValuePack } = require('./backend/models');

async function check() {
  try {
    const packs = await ValuePack.findAll();
    console.log('PACKS_COUNT:', packs.length);
    console.log('PACKS_DATA:', JSON.stringify(packs, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
