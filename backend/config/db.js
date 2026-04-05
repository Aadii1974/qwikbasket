const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false,
});

const connectDB = async () => {
  try {
    // Attempt to create DB if it doesn't exist
    const connection = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();

    await sequelize.authenticate();
    console.log(`✅ MySQL Database '${DB_NAME}' connected.`);
  } catch (err) {
    console.error('❌ Database Initialization Error (Check .env):', err.message);
    // Don't exit, just let it fail silently and show error on API calls
  }
};

module.exports = { sequelize, connectDB };
