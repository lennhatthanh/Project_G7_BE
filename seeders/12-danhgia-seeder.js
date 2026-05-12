/**
 * Seeder: Reviews/Ratings (Đánh Giá)
 * Transaction data - 75,000 records
 * Dependencies: vitrisans, nguoidungs
 * Note: ~25% of bookings get reviews (75k / 300k bookings)
 */
const { randomSelect, randomStarRating, generateDescription } = require('./utils');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all vitrisan and nguoidung IDs
    const vitrisans = await queryInterface.sequelize.query(
      'SELECT id FROM vitrisans',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const nguoidungs = await queryInterface.sequelize.query(
      'SELECT id FROM nguoidungs',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (vitrisans.length === 0 || nguoidungs.length === 0) {
      throw new Error('No vitrisans or nguoidungs found. Please seed them first.');
    }

    const records = [];
    const totalRecords = 75000;

    console.log('Generating 75,000 review records...');

    for (let i = 0; i < totalRecords; i++) {
      const vitrisan = randomSelect(vitrisans);
      const nguoidung = randomSelect(nguoidungs);

      records.push({
        id_vi_tri_san: vitrisan.id,
        id_nguoi_dung: nguoidung.id,
        so_sao: randomStarRating(), // Weighted distribution: more 4-5 stars
        danh_gia: generateDescription(10),
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if ((i + 1) % 15000 === 0) {
        console.log(`  Generated ${i + 1}/${totalRecords} records`);
      }
    }

    // Insert in batches
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('danhgias', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded danhgias ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('danhgias', null, {});
  }
};
