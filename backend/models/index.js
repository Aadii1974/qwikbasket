const { sequelize } = require('../config/db');
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const SubCategory = require('./SubCategory');
const Store = require('./Store');
const Address = require('./Address');
const ServiceablePincode = require('./ServiceablePincode');
const Order = require('./Order');
const Settings = require('./Settings');
const PaymentSettlement = require('./PaymentSettlement');
const Coupon = require('./Coupon');
const WalletTransaction = require('./WalletTransaction');
const Banner = require('./Banner');


// Define Relationships Here
Category.hasMany(SubCategory, { foreignKey: 'categoryId', as: 'subcategories', onDelete: 'CASCADE' });
SubCategory.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Stores have many products
Store.hasMany(Product, { foreignKey: 'storeId', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// Products can optionally belong to a Category and Subcategory
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryModel' }); 

SubCategory.hasMany(Product, { foreignKey: 'subCategoryId', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId', as: 'subCategoryModel' });

// User-Address Relationship
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User-Order Relationship
User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Delivery Agent Relationship
User.hasMany(Order, { foreignKey: 'deliveryAgentId', as: 'deliveries' });
Order.belongsTo(User, { foreignKey: 'deliveryAgentId', as: 'deliveryAgent' });

// User-WalletTransaction Relationship
User.hasMany(WalletTransaction, { foreignKey: 'userId', as: 'walletTransactions', onDelete: 'CASCADE' });
WalletTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order-WalletTransaction Relationship
Order.hasMany(WalletTransaction, { foreignKey: 'orderId', as: 'walletTransactions' });
WalletTransaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  SubCategory,
  Store,
  Address,
  ServiceablePincode,
  Order,
  Settings,
  PaymentSettlement,
  Coupon,
  WalletTransaction,
  Banner
};

