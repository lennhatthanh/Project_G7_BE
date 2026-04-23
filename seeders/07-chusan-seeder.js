/**
 * Seeder: Court Owners (Chủ Sân)
 * User data - 500 records
 * Dependencies: None
 */
const { generateEmail, generatePhone, generateVietnameseName, randomSelect } = require('./utils');
const bcryptjs = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const records = [];
    const totalRecords = 500;

    // Static password for all test accounts (hash it)
    const hashedPassword = await bcryptjs.hash('Owner@123456', 10);

    for (let i = 0; i < totalRecords; i++) {
      records.push({
        ho_ten: generateVietnameseName(),
        email: generateEmail(i, 'chusan'),
        mat_khau: hashedPassword,
        so_dien_thoai: generatePhone(i + 1000), // Offset to avoid collision with other tables
        gioi_tinh: randomSelect(['Nam', 'Nữ', 'Khác']),
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('chusans', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded chusans ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('chusans', null, {});
  }
};
