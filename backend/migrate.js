const { sequelize } = require('./config/db');
const { Coupon, WalletTransaction } = require('./models');

async function migrate() {
  try {
     console.log('Synchronizing database...');
     
     // Add farmerCoins if not exists
     try {
       await sequelize.query('ALTER TABLE Users ADD COLUMN farmerCoins FLOAT DEFAULT 0');
       console.log('Added farmerCoins to Users');
     } catch (e) {
       console.log('Column farmerCoins might already exist or error: ', e.message);
     }
     
     // Add couponCode to Orders if not exists
     try {
       await sequelize.query('ALTER TABLE Orders ADD COLUMN couponCode VARCHAR(255) DEFAULT NULL');
       try {
         await sequelize.query('ALTER TABLE Orders ADD COLUMN discountAmount FLOAT DEFAULT 0');
         await sequelize.query('ALTER TABLE Orders ADD COLUMN coinsRedeemed FLOAT DEFAULT 0');
         await sequelize.query('ALTER TABLE Orders ADD COLUMN coinsEarned FLOAT DEFAULT 0');
       } catch (err) {}
       console.log('Added coupon columns to Orders');
     } catch (e) {
       console.log('Coupon columns might already exist or error: ', e.message);
     }

     // Add Farmer Coin settings to Settings
     try {
       await sequelize.query('ALTER TABLE Settings ADD COLUMN farmerCoinEarningPercentage FLOAT DEFAULT 5');
       await sequelize.query('ALTER TABLE Settings ADD COLUMN farmerCoinRedemptionRate FLOAT DEFAULT 1');
       console.log('Added Farmer Coin settings to Settings');
     } catch (e) {
       console.log('Farmer Coin settings might already exist or error: ', e.message);
     }

     // Sync new tables
     await Coupon.sync();
     console.log('Synchronized Coupons');
     await WalletTransaction.sync();
     console.log('Synchronized WalletTransactions');
     
     process.exit(0);
  } catch (err) {
     console.error(err);
     process.exit(1);
  }
}

migrate();
