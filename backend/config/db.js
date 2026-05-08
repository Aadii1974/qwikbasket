const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME, DATABASE_URL } = process.env;

// Dynamically configure SSL if in Render or requested via DB_SSL
const dialectOptions = {};
if (process.env.RENDER === 'true' || process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    rejectUnauthorized: false,
  };
}

let sequelize;

if (DATABASE_URL) {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions,
  });
} else {
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions,
  });
}

const connectDB = async () => {
  // Only attempt to auto-create the database in local environment (not on Render/production)
  // and when a direct DATABASE_URL is not provided (which already includes the database name and is pre-allocated)
  if (process.env.RENDER !== 'true' && !DATABASE_URL) {
    try {
      if (DB_HOST && DB_USER) {
        console.log(`🔄 Checking if database '${DB_NAME}' exists...`);
        const connection = await mysql.createConnection({
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASS,
          port: process.env.DB_PORT || 3306,
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        await connection.end();
        console.log(`✅ Database checked/created successfully.`);
      }
    } catch (err) {
      console.warn('⚠️ Could not auto-create database (this is normal on managed cloud environments due to privilege restrictions):', err.message);
    }
  }

  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL Database connected successfully.`);
  } catch (err) {
    console.error('❌ Database connection/authentication failed:', err.message);
    throw err; // Rethrow to prevent index.js from trying to run sequelize.sync() on a broken connection
  }
};

module.exports = { sequelize, connectDB };

