/**
 * Seeder: Announcements (Thông Báo)
 * Supporting data - 1,500 records
 * Dependencies: santhethaos
 */
const { randomSelect, randomDateBetween, getDateRange, generateDescription } = require('./utils');

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

    const { pastStart, pastEnd } = getDateRange();
    const records = [];
    const totalRecords = 1500;

    for (let i = 0; i < totalRecords; i++) {
      const santhetha = randomSelect(santhethaos);

      records.push({
        id_san: santhetha.id,
        tieu_de: `Thông Báo ${i + 1}`,
        noi_dung: generateDescription(20),
        tinh_trang: true,
        createdAt: randomDateBetween(pastStart, pastEnd),
        updatedAt: new Date()
      });
    }

    // Insert in batches
    const batchSize = 300;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('thongbaos', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded thongbaos ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('thongbaos', null, {});
  }
};
