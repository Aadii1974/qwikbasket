const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

// To change the password, set the target phone and new password here:
const TARGET_PHONE = "9876543210"; 
const NEW_PASSWORD = "Realfarms@3Y2026"; // Change this to whatever password you want!

async function changePassword() {
  try {
    console.log(`🔄 Connecting to Aiven database to change password for phone: ${TARGET_PHONE}...`);
    await sequelize.authenticate();

    const user = await User.findOne({ where: { phone: TARGET_PHONE } });
    if (!user) {
      console.error(`❌ User with phone ${TARGET_PHONE} not found in the database.`);
      process.exit(1);
    }

    console.log(`🔑 Hashing new password...`);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    console.log(`💾 Saving new password to database...`);
    await user.update({ password: hashedPassword });

    console.log(`\n✅ SUCCESS! Password for user "${user.name}" (${TARGET_PHONE}) has been changed successfully.`);
    console.log(`🔑 Your new password is: ${NEW_PASSWORD}\n`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error changing password:", err.message);
    process.exit(1);
  }
}

changePassword();
