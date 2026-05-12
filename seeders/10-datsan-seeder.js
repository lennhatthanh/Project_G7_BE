/**
 * Seeder: Court Bookings (Đặt Sân)
 * Transaction data - 300,000 records (BATCH PROCESSED)
 * Dependencies: vitrisans, nguoidungs
 * Note: This is the largest table and uses 1k record batches to manage memory
 */
const { generateOrderCode, randomDateBetween, randomBookingTime, getDateRange, randomSelect, randomBool, randomPrice } = require('./utils');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all vitriisan and nguoidung IDs
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

    const { pastStart, futureEnd } = getDateRange();
    const records = [];
    const totalRecords = 300000;

    console.log('Generating 300,000 booking records (this may take a minute)...');

    for (let i = 0; i < totalRecords; i++) {
      const vitrisan = vitrisans[i % vitrisans.length];
      const nguoidung = randomSelect(nguoidungs);
      const bookingDate = randomDateBetween(pastStart, futureEnd);

      records.push({
        id_vi_tri_dat_san: vitrisan.id,
        id_nguoi_dung: nguoidung.id,
        ngay_dat: bookingDate,
        gio_dat: randomBookingTime(),
        thanh_tien: randomPrice('court'), // Court price
        orderCode: generateOrderCode(i, bookingDate),
        tinh_trang: randomBool(0.7), // 70% confirmed, 30% pending
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if ((i + 1) % 50000 === 0) {
        console.log(`  Generated ${i + 1}/${totalRecords} records`);
      }
    }

    // Insert in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('datsans', batch, { ignoreDuplicates: true });
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded datsans ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('datsans', null, {});
  }
};
