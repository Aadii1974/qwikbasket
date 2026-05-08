const { sequelize, Product, Category, Store } = require('./models');

async function testCreate() {
  try {
    console.log("⚡ Starting diagnostic creation test...");
    
    // 1. Authenticate
    await sequelize.authenticate();
    console.log("✅ Authenticated successfully with Aiven MySQL.");

    // 2. Try creating a Store
    console.log("🔄 Attempting to create a Store...");
    const store = await Store.create({
      name: "Test Store",
      address: "123 Test St",
      pincode: "401105",
      contact: "1234567890"
    });
    console.log("✅ Store created successfully:", store.id);

    // 3. Try creating a Category
    console.log("🔄 Attempting to create a Category...");
    const category = await Category.create({
      name: "Test Category",
      image: "test-category.png"
    });
    console.log("✅ Category created successfully:", category.id);

    // 4. Try creating a Product
    console.log("🔄 Attempting to create a Product...");
    const product = await Product.create({
      name: "Test Apple",
      unit: "1 kg",
      ratePerUnit: "₹100/kg",
      customerType: "BOTH",
      b2cNewPrice: 100,
      b2cOldPrice: 120,
      stock: 50,
      storeId: store.id,
      categoryId: category.id
    });
    console.log("✅ Product created successfully:", product.id);

    console.log("🎉 DIAGNOSTIC TEST PASSED: No errors found during creation!");
    process.exit(0);
  } catch (err) {
    console.error("❌ DIAGNOSTIC TEST FAILED! Captured Error:");
    console.error(err);
    process.exit(1);
  }
}

testCreate();
