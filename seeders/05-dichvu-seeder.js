/**
 * Seeder: Services (Dịch Vụ)
 * Master data - 1,500 records
 * Dependencies: santhethaos
 */
const { getServiceTypes, randomPrice, randomSelect } = require('./utils');

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

    const serviceTypes = getServiceTypes();
    const records = [];
    const totalRecords = 1500;

    for (let i = 0; i < totalRecords; i++) {
      const santhetha = randomSelect(santhethaos);
      const serviceName = randomSelect(serviceTypes);

      records.push({
        id_san: santhetha.id,
        ten_dich_vu: `${serviceName} - ${Math.floor(Math.random() * 100) + 1}`,
        mo_ta: `Dịch vụ ${serviceName.toLowerCase()} chất lượng cao tại sân`,
        don_gia: randomPrice('service'),
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert in batches
    const batchSize = 500;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('dichvus', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded dichvus ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('dichvus', null, {});
  }
};
