/**
 * Seeder: Court Positions (Vị Trí Sân)
 * Master data - 3,500 records
 * Dependencies: santhethaos, monchois
 */
const { randomPrice, generateDescription, randomSelect } = require('./utils');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all santhethao and monchoi IDs
    const santhethaos = await queryInterface.sequelize.query(
      'SELECT id FROM santhethaos',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const monchois = await queryInterface.sequelize.query(
      'SELECT id FROM monchois',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (santhethaos.length === 0 || monchois.length === 0) {
      throw new Error('No santhethaos or monchois found. Please seed them first.');
    }

    const records = [];
    const totalRecords = 3500;

    for (let i = 0; i < totalRecords; i++) {
      const santhetha = randomSelect(santhethaos);
      const monchoi = randomSelect(monchois);
      const courtNumber = Math.floor(Math.random() * 5) + 1; // 1-5 courts per location

      records.push({
        id_san: santhetha.id,
        id_mon_choi: monchoi.id,
        so_san: courtNumber,
        gia_san: randomPrice('court'),
        mo_ta: generateDescription(5),
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert in batches
    const batchSize = 500;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('vitrisans', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded vitrisans ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('vitrisans', null, {});
  }
};
