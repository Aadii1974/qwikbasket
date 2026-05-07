require('dotenv').config();
const { ValuePack } = require('./models');

async function create() {
  try {
    const pack = await ValuePack.create({
      name: 'Test Hamper',
      description: 'A test hamper with items',
      price: 500,
      originalPrice: 700,
      items: [
        { productId: 'test-1', name: 'Product 1', quantity: 1, unit: 'kg', priceSnapshot: 350 },
        { productId: 'test-2', name: 'Product 2', quantity: 1, unit: 'piece', priceSnapshot: 350 }
      ],
      isActive: true,
      stock: 50
    });
    console.log('CREATED_PACK:', pack.id);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
create();
