/**
 * Seeder: Events (Sự Kiện)
 * Supporting data - 500 records
 * Dependencies: santhethaos
 */
const { randomSelect, randomDateBetween, getDateRange, randomPrice, generateDescription } = require('./utils');

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
    const totalRecords = 500;

    for (let i = 0; i < totalRecords; i++) {
      const santhetha = randomSelect(santhethaos);
      const eventStart = randomDateBetween(futureStart, futureEnd);
      const eventEnd = new Date(eventStart);
      eventEnd.setDate(eventEnd.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days duration

      records.push({
        id_san: santhetha.id,
        ten_su_kien: `Giải Đấu ${i + 1}`,
        noi_dung: generateDescription(15),
        thoi_gian_bat_dau: eventStart,
        thoi_gian_ket_thuc: eventEnd,
        so_luong: Math.floor(Math.random() * 200) + 10, // 10-210 participants
        phi_tham_gia: Math.floor(Math.random() * 450) + 50, // 50k-500k VND
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('sukiens', records);
    console.log(`✓ Seeded ${records.length} events`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sukiens', null, {});
  }
};
