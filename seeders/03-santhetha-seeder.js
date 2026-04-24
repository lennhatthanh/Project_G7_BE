/**
 * Seeder: Sports Courts (Sân Thể Thao)
 * Master data - 750 records
 * Dependencies: chusans
 */
const { generateRandomAddress, getDistricts, getProvinces, getCourtNames, randomSelect, generateRandomGPS, generateDescription } = require('./utils');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all chusan IDs
    const chusans = await queryInterface.sequelize.query(
      'SELECT id FROM chusans',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (chusans.length === 0) {
      throw new Error('No chusans found. Please seed chusans first.');
    }

    const records = [];
    const totalRecords = 750;

    for (let i = 0; i < totalRecords; i++) {
      const chusan = chusans[i % chusans.length];
      const district = randomSelect(getDistricts());
      const province = randomSelect(getProvinces());
      const gps = generateRandomGPS();

      records.push({
        id_chu_san: chusan.id,
        ten_san: `${randomSelect(getCourtNames())} ${Math.floor(Math.random() * 100) + 1}`,
        loai_san: randomSelect(['Bóng đá', 'Cầu lông', 'Tennis', 'Bóng chuyền', 'Bóng rổ']),
        icon: 'court-icon',
        huyen: district,
        thanh_pho: province,
        dia_chi_cu_the: generateRandomAddress(),
        mo_ta: generateDescription(10),
        hinh_anh: `https://via.placeholder.com/400?text=Court${i}`,
        gio_mo_cua: '06:00:00',
        gio_dong_cua: '23:00:00',
        kinh_do: gps.latitude,
        vi_do: gps.longitude,
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      await queryInterface.bulkInsert('santhethaos', batch);
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Seeded santhethaos ${i + batchSize}/${records.length} (${percentComplete}%)`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('santhethaos', null, {});
  }
};
