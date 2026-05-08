const { sequelize, User, Store, Category, SubCategory, Product } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log("⚡ Starting Aiven Database Seeding & Validation...");

    // 1. Authenticate connection
    await sequelize.authenticate();
    console.log("✅ Authenticated successfully with Aiven MySQL.");

    // 2. Synchronize models
    console.log("🔄 Synchronizing database tables...");
    await sequelize.sync();
    console.log("✅ Database tables synced successfully.");

    // 3. Create Admin User
    console.log("🔄 Checking/Creating Admin User...");
    const adminPhone = "9876543210";
    let admin = await User.findOne({ where: { phone: adminPhone } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = await User.create({
        name: "Aditya Admin",
        phone: adminPhone,
        password: hashedPassword,
        role: "admin",
        isApproved: true
      });
      console.log("✅ Admin User created successfully!");
    } else {
      console.log("ℹ️ Admin User already exists.");
    }

    // 4. Create default Store
    console.log("🔄 Checking/Creating default Store...");
    let store = await Store.findOne({ where: { name: "Mumbai Main Store" } });
    if (!store) {
      store = await Store.create({
        name: "Mumbai Main Store",
        address: "Mira-Bhayander, Mumbai",
        pincode: "401105",
        contact: "9876543210"
      });
      console.log("✅ Store 'Mumbai Main Store' created successfully!");
    } else {
      console.log("ℹ️ Store 'Mumbai Main Store' already exists.");
    }

    // 5. Create default Category
    console.log("🔄 Checking/Creating default Category...");
    let category = await Category.findOne({ where: { name: "Fresh Fruits" } });
    if (!category) {
      category = await Category.create({
        name: "Fresh Fruits",
        slug: "fresh-fruits",
        image: "https://res.cloudinary.com/dbxz0xoko/image/upload/v1714567890/fruits.png",
        isVegetable: false
      });
      console.log("✅ Category 'Fresh Fruits' created successfully!");
    } else {
      console.log("ℹ️ Category 'Fresh Fruits' already exists.");
    }

    // 6. Create default SubCategory
    console.log("🔄 Checking/Creating default SubCategory...");
    let subcategory = await SubCategory.findOne({ where: { name: "Apples & Pears" } });
    if (!subcategory) {
      subcategory = await SubCategory.create({
        name: "Apples & Pears",
        slug: "apples-pears",
        categoryId: category.id
      });
      console.log("✅ SubCategory 'Apples & Pears' created successfully!");
    } else {
      console.log("ℹ️ SubCategory 'Apples & Pears' already exists.");
    }

    // 7. Create default Product
    console.log("🔄 Checking/Creating default Product...");
    let product = await Product.findOne({ where: { name: "Royal Gala Apples" } });
    if (!product) {
      product = await Product.create({
        name: "Royal Gala Apples",
        unit: "1 kg",
        ratePerUnit: "₹180/kg",
        customerType: "BOTH",
        b2cNewPrice: 180,
        b2cOldPrice: 200,
        stock: 100,
        images: JSON.stringify(["https://res.cloudinary.com/dbxz0xoko/image/upload/v1714567890/gala-apples.png"]),
        description: "Sweet and crunchy Royal Gala Apples direct from local orchards.",
        storeId: store.id,
        categoryId: category.id,
        subCategoryId: subcategory.id,
        isBulkOnly: false
      });
      console.log("✅ Product 'Royal Gala Apples' created successfully!");
    } else {
      console.log("ℹ️ Product 'Royal Gala Apples' already exists.");
    }

    console.log("\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉");
    console.log("--------------------------------------------------");
    console.log("You can now log in with these Admin Credentials:");
    console.log(`📱 Phone: ${adminPhone}`);
    console.log("🔑 Password: admin123");
    console.log("--------------------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ SEEDING FAILED! Caught Database Error:");
    console.error(err);
    process.exit(1);
  }
}

seed();
