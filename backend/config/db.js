const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DATABASE_URL,
  DB_SSL: rawDBSSL,
} = process.env;

const localHosts = ['localhost', '127.0.0.1', '::1'];
const isLocalHost = DB_HOST ? localHosts.includes(DB_HOST) : false;
const isSSLExplicitlyTrue = rawDBSSL === 'true';
const isSSLExplicitlyFalse = rawDBSSL === 'false';
const useSSL = isSSLExplicitlyTrue || (!isLocalHost && DB_HOST && DB_HOST !== '' && !isSSLExplicitlyFalse);

const getDialectOptions = (sslEnabled) => {
  if (!sslEnabled) return {};
  return {
    ssl: {
      rejectUnauthorized: false,
    },
  };
};

const buildSequelizeInstance = (sslEnabled = useSSL) => {
  const dialectOptionsForInstance = getDialectOptions(sslEnabled);

  if (DATABASE_URL) {
    return new Sequelize(DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: dialectOptionsForInstance,
    });
  }

  if (DB_NAME && DB_USER) {
    return new Sequelize(DB_NAME, DB_USER, DB_PASS, {
      host: DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: dialectOptionsForInstance,
    });
  }

  return null;
};

let sequelize = buildSequelizeInstance();

const connectDB = async () => {
  if (process.env.RENDER !== 'true' && !DATABASE_URL) {
    try {
      if (DB_HOST && DB_USER) {
        console.log(`🔄 Checking if database '${DB_NAME}' exists...`);
        const connectionOptions = {
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASS,
          port: process.env.DB_PORT || 3306,
        };

        if (useSSL) {
          connectionOptions.ssl = { rejectUnauthorized: false };
        }

        let connection;
        try {
          connection = await mysql.createConnection(connectionOptions);
        } catch (createErr) {
          if (!useSSL && !isLocalHost) {
            console.warn('⚠️ Initial DB creation connection failed. Retrying with SSL enabled...');
            connectionOptions.ssl = { rejectUnauthorized: false };
            connection = await mysql.createConnection(connectionOptions);
          } else {
            throw createErr;
          }
        }

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        await connection.end();
        console.log(`✅ Database checked/created successfully.`);
      }
    } catch (err) {
      console.warn('⚠️ Could not auto-create database (this is normal on managed cloud environments due to privilege restrictions):', err.message);
    }
  }

  try {
    if (!sequelize) {
      throw new Error('Sequelize was not initialized. Check your database credentials in .env');
    }

    console.log(`🔌 Connecting to MySQL (${DATABASE_URL ? 'using DATABASE_URL' : `host: ${DB_HOST}:${process.env.DB_PORT || 3306}`})...`);
    await sequelize.authenticate();
    console.log(`✅ MySQL Database connected successfully.`);
    return true;
  } catch (err) {
    console.error(`❌ Database connection failed (${err.message}).`);

    // If host explicitly closed connection or refused, retrying with SSL won't help
    const isConnectionClosed = err.message.includes('closed') || err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND');

    const shouldRetryWithSSL = !useSSL && !isConnectionClosed && (DATABASE_URL || !isLocalHost);
    if (shouldRetryWithSSL) {
      console.warn('⚠️ Retrying connection with SSL enabled...');
      sequelize = buildSequelizeInstance(true);
      try {
        await sequelize.authenticate();
        console.log('✅ MySQL Database connected successfully on retry (SSL enabled).');
        return true;
      } catch (retryErr) {
        console.error(`❌ Retry with SSL also failed (${retryErr.message}).`);
      }
    }

    if (process.env.RENDER === 'true') {
      throw err; // In production/Render, crash so deployment environment alerts us
    }
    
    if (DB_HOST && DB_HOST.includes('rlwy.net')) {
      console.warn('💡 NOTICE: Remote Railway database (autorack.proxy.rlwy.net) is unreachable or expired.');
      console.warn('👉 To connect to a local database, update backend/.env with your local MySQL credentials:');
      console.warn('   DB_HOST=localhost');
      console.warn('   DB_USER=root');
      console.warn('   DB_PASS=your_mysql_password');
      console.warn('   DB_NAME=realfarms');
      console.warn('   (Comment out DATABASE_URL by placing # in front)');
    } else {
      console.warn('⚠️ Database is currently offline. Server starting in offline fallback mode.');
    }
    return false;
  }
};

module.exports = { sequelize, connectDB };


