/**
 * Seeder: Administrators (Admin)
 * User data - 5 records
 * Dependencies: None
 */
const { generateEmail, generatePhone, generateVietnameseName, randomSelect } = require('./utils');
const bcryptjs = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const records = [];
    const totalRecords = 5;

    // Static password for all test accounts (hash it)
    const hashedPassword = await bcryptjs.hash('Admin@123456', 10);

    for (let i = 0; i < totalRecords; i++) {
      records.push({
        ho_ten: generateVietnameseName(),
        email: generateEmail(i, 'admin'),
        mat_khau: hashedPassword,
        so_dien_thoai: generatePhone(i),
        gioi_tinh: randomSelect(['Nam', 'Nữ', 'Khác']),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('admins', records);
    console.log(`✓ Seeded ${records.length} administrators`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('admins', null, {});
  }
};
