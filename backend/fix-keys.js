const { connectDB, sequelize } = require('./config/db');

async function fixKeys() {
  await connectDB();
  try {
    const [tables] = await sequelize.query('SHOW TABLES');
    const dbName = sequelize.config.database;
    const tableNames = tables.map(t => t[`Tables_in_${dbName}`]);

    for (const tableName of tableNames) {
      console.log(`Checking table: ${tableName}`);
      const [results] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);
      
      // Group indexes by column name
      const keys = results.filter(r => r.Key_name !== 'PRIMARY');
      
      // We want to drop duplicate unique indexes on the same column.
      // E.g. 'name', 'name_2', 'name_3', etc.
      // Let's identify the prefixes.
      const keysToDrop = keys.map(r => r.Key_name).filter(name => /\_\d+$/.test(name));
      
      if (keysToDrop.length > 0) {
        console.log(`Dropping keys from ${tableName}:`, keysToDrop);
        for (const key of keysToDrop) {
          try {
            await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${key}\``);
          } catch(e) {
            console.log(`Failed to drop ${key} from ${tableName}:`, e.message);
          }
        }
      }
    }
    
    console.log('Duplicate keys dropped.');
    
    // Now sync
    console.log('Syncing DB with alter: true...');
    await sequelize.sync({ alter: true });
    console.log('✅ DB Synced successfully!');
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

fixKeys();
