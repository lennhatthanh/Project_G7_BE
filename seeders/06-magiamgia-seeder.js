/**
 * Seeder: Discount Codes (Mã Giảm Giá)
 * Master data - 250 records (middle of 0-500 range, reasonable for 750 courts)
 * Dependencies: santhethaos
 */
const { generateDiscountCode, randomSelect, randomDateBetween, getDateRange } = require('./utils');

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

    const { futureStart, futureEnd } = getDateRange();
    const records = [];
    const totalRecords = 250;

    for (let i = 0; i < totalRecords; i++) {
      const santhetha = randomSelect(santhethaos);
      const isPercentage = Math.random() < 0.6; // 60% percentage, 40% fixed amount
      const isPercentageType = isPercentage ? 'Phần Trăm' : 'Tiền Mặt';
      const discountValue = isPercentage 
        ? Math.floor(Math.random() * 25) + 5  // 5-30%
        : Math.floor(Math.random() * 190) + 10; // 10k-200k VND

      const startDate = randomDateBetween(new Date(), futureStart);
      const endDate = randomDateBetween(startDate, futureEnd);

      records.push({
        id_san: santhetha.id,
        ma_giam_gia: generateDiscountCode(),
        gia_tri_giam: discountValue,
        mo_ta: `Giảm giá ${discountValue}${isPercentage ? '%' : 'k VND'} cho ${santhetha.id}`,
        loai_giam_gia: isPercentageType,
        ngay_bat_dau: startDate,
        ngay_ket_thuc: endDate,
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('magiamgias', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded magiamgias ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('magiamgias', null, {});
  }
};
