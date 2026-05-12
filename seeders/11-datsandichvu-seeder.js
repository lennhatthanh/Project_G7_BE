/**
 * Seeder: Booking-Services (Đặt Sân Dịch Vụ)
 * Transaction data - 500,000 records (BATCH PROCESSED)
 * Dependencies: datsans, dichvus
 * Note: This is the LARGEST table - uses 5k record batches
 * Ratio: ~1.67 services per booking on average
 */
const { randomSelect } = require('./utils');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all datsan and dichvu IDs
    const datsans = await queryInterface.sequelize.query(
      'SELECT id FROM datsans',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const dichvus = await queryInterface.sequelize.query(
      'SELECT id FROM dichvus',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (datsans.length === 0 || dichvus.length === 0) {
      throw new Error('No datsans or dichvus found. Please seed them first.');
    }

    const records = [];
    const totalRecords = 500000;

    console.log('Generating 500,000 booking-service records (this will take 1-2 minutes)...');

    for (let i = 0; i < totalRecords; i++) {
      // Each booking links to 1-2 services on average
      const datsan = datsans[i % datsans.length];
      const dichvu = randomSelect(dichvus);

      records.push({
        id_dich_vu: dichvu.id,
        id_dat_san: datsan.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if ((i + 1) % 100000 === 0) {
        console.log(`  Generated ${i + 1}/${totalRecords} records`);
      }
    }

    // Insert in batches of 5000 (larger batch for this huge table)
    const batchSize = 5000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('datsandichvus', batch, { validate: false });
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded datsandichvus ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('datsandichvus', null, {});
  }
};
