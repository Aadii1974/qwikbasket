const { sequelize } = require('../config/db');
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const SubCategory = require('./SubCategory');

// Define Relationships Here
Category.hasMany(SubCategory, { foreignKey: 'CategoryId', as: 'subcategories', onDelete: 'CASCADE' });
SubCategory.belongsTo(Category, { foreignKey: 'CategoryId', as: 'category' });

// Products can optionally belong to a Category and Subcategory
Category.hasMany(Product, { foreignKey: 'CategoryId', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'CategoryId', as: 'categoryModel' }); // using 'categoryModel' so we don't conflict with existing 'category' string field yet

SubCategory.hasMany(Product, { foreignKey: 'SubCategoryId', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(SubCategory, { foreignKey: 'SubCategoryId', as: 'subCategoryModel' });

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  SubCategory
};
