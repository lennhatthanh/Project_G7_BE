/**
 * Seeder: Court Staff (Nhân Viên)
 * User data - 1,500 records
 * Dependencies: santhethaos
 */
const { generateEmail, generatePhone, generateVietnameseName, randomSelect } = require('./utils');
const bcryptjs = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all santhethao IDs
    const santhethaos = await queryInterface.sequelize.query(
      'SELECT id FROM santhethaos',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (santhethaos.length === 0) {
      throw new Error('No santhethaos found. Please seed santhethaos first.');
    }

    const records = [];
    const totalRecords = 1500;

    // Static password for all test accounts (hash it)
    const hashedPassword = await bcryptjs.hash('Staff@123456', 10);

    for (let i = 0; i < totalRecords; i++) {
      const santhetha = santhethaos[i % santhethaos.length];

      records.push({
        id_san: santhetha.id,
        ho_ten: generateVietnameseName(),
        email: generateEmail(i, 'nhanvien'),
        so_dien_thoai: generatePhone(i + 2000), // Offset to avoid collision
        mat_khau: hashedPassword,
        gioi_tinh: randomSelect(['Nam', 'Nữ', 'Khác']),
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert in batches
    const batchSize = 300;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('nhanviens', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded nhanviens ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('nhanviens', null, {});
  }
};
