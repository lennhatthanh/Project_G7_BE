/**
 * Seeder: Payment History (Lịch Sử Thanh Toán)
 * Supporting data - 300,000 records (one per confirmed booking)
 * Dependencies: datsans (confirmed bookings only)
 * Note: Only seeds for tinh_trang = true bookings
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all confirmed datsans (tinh_trang = true)
    const confirmedBookings = await queryInterface.sequelize.query(
      'SELECT id, thanh_tien FROM datsans WHERE tinh_trang = true',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (confirmedBookings.length === 0) {
      console.log('No confirmed bookings found. Skipping payment history seeding.');
      return;
    }

    const records = [];

    console.log(`Generating ${confirmedBookings.length} payment history records...`);

    confirmedBookings.forEach((booking, index) => {
      records.push({
        id_dat_san: booking.id,
        phuong_thuc: 'Chuyển Khoản', // Bank transfer only
        thanh_tien: booking.thanh_tien.toString(),
        tinh_trang: true, // All payments processed
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if ((index + 1) % 50000 === 0) {
        console.log(`  Generated ${index + 1}/${confirmedBookings.length} records`);
      }
    });

    // Insert in batches of 5000
    const batchSize = 5000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('lichsuthanhtoans', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded lichsuthanhtoans ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('lichsuthanhtoans', null, {});
  }
};
