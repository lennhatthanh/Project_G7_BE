/**
 * Seeder: End Users (Người Dùng)
 * User data - 30,000 records
 * Dependencies: None
 */
const { generateEmail, generatePhone, generateVietnameseName, randomSelect, batchInsert } = require('./utils');
const bcryptjs = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const records = [];
    const totalRecords = 30000;

    // Static password for all test accounts (hash it once)
    const hashedPassword = await bcryptjs.hash('User@123456', 10);

    console.log('Generating 30,000 user records...');
    for (let i = 0; i < totalRecords; i++) {
      records.push({
        ho_ten: generateVietnameseName(),
        email: generateEmail(i, 'user'),
        so_dien_thoai: generatePhone(i + 3000), // Offset to avoid collision
        mat_khau: hashedPassword,
        gioi_tinh: randomSelect(['Nam', 'Nữ', 'Khác']),
        is_verified: randomSelect([true, false, false, false]), // 25% verified
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if ((i + 1) % 5000 === 0) {
        console.log(`  Generated ${i + 1}/${totalRecords} records`);
      }
    }

    // Insert in batches
    const batchSize = 2000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('nguoidungs', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded nguoidungs ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('nguoidungs', null, {});
  }
};
