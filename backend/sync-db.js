const { sequelize, Order, Settings } = require('./models');

async function sync() {
  try {
    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    console.log('Current tables:', tables);

    // Helper to add column if not exists
    const addColumnIfNotExists = async (tableName, column, definition) => {
      try {
        const desc = await qi.describeTable(tableName);
        if (!desc[column]) {
          console.log(`Adding column ${column} to ${tableName}...`);
          await qi.addColumn(tableName, column, definition);
        }
      } catch (e) {
        console.warn(`Error checking/adding column ${column} to ${tableName}:`, e.message);
      }
    };

    // Fix Orders table
    await addColumnIfNotExists('Orders', 'packagingFee', { type: 'FLOAT', defaultValue: 10 });
    await addColumnIfNotExists('Orders', 'smallCartFee', { type: 'FLOAT', defaultValue: 0 });
    await addColumnIfNotExists('Orders', 'deliveryType', { type: "ENUM('Smart', 'Qwik')", defaultValue: 'Smart' });

    // Fix Settings table
    await addColumnIfNotExists('Settings', 'standardDeliveryFee', { type: 'FLOAT', defaultValue: 25 });
    await addColumnIfNotExists('Settings', 'smallCartFeeThreshold', { type: 'FLOAT', defaultValue: 100 });
    await addColumnIfNotExists('Settings', 'smallCartFeeAmount', { type: 'FLOAT', defaultValue: 10 });
    await addColumnIfNotExists('Settings', 'lowOrderFeeThreshold', { type: 'FLOAT', defaultValue: 50 });
    await addColumnIfNotExists('Settings', 'lowOrderFeeAmount', { type: 'FLOAT', defaultValue: 15 });
    await addColumnIfNotExists('Settings', 'packagingFee', { type: 'FLOAT', defaultValue: 10 });
    await addColumnIfNotExists('Settings', 'qwikDeliveryFee', { type: 'FLOAT', defaultValue: 30 });
    await addColumnIfNotExists('Settings', 'qwikDeliveryCutoffHour', { type: 'INTEGER', defaultValue: 20 });
    await addColumnIfNotExists('Settings', 'nightModeStartHour', { type: 'INTEGER', defaultValue: 0 });
    await addColumnIfNotExists('Settings', 'nightModeEndHour', { type: 'INTEGER', defaultValue: 6 });
    await addColumnIfNotExists('Settings', 'googleMapsApiKey', { type: 'VARCHAR(255)', defaultValue: '' });
    await addColumnIfNotExists('Settings', 'razorpayKeyId', { type: 'VARCHAR(255)', defaultValue: '' });
    await addColumnIfNotExists('Settings', 'razorpayKeySecret', { type: 'VARCHAR(255)', defaultValue: '' });
    await addColumnIfNotExists('Settings', 'agentPayPerKm', { type: 'FLOAT', defaultValue: 5 });
    await addColumnIfNotExists('Settings', 'agentMinPayPerOrder', { type: 'FLOAT', defaultValue: 20 });
    await addColumnIfNotExists('Settings', 'agentIncentiveThreshold', { type: 'INTEGER', defaultValue: 10 });
    await addColumnIfNotExists('Settings', 'agentIncentiveAmount', { type: 'FLOAT', defaultValue: 50 });
    await addColumnIfNotExists('Settings', 'farmerCoinEarningPercentage', { type: 'FLOAT', defaultValue: 5 });
    await addColumnIfNotExists('Settings', 'farmerCoinRedemptionRate', { type: 'FLOAT', defaultValue: 1 });
    await addColumnIfNotExists('Settings', 'splashVideoUrl', { type: 'VARCHAR(1000)', defaultValue: '' });

    // Ensure Settings row exists
    await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });

    console.log('✅ Database schema synchronized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

sync();
