const {
  generateRandomAddress,
  getDistricts,
  getProvinces,
  getCourtNames,
  randomSelect,
  generateRandomGPS,
  generateDescription
} = require('./utils');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const chusans = await queryInterface.sequelize.query(
      'SELECT id FROM chusans',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!chusans.length) {
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
        ten_san: `${randomSelect(getCourtNames())} ${i + 1}`,
        loai_san: randomSelect(['Bóng đá', 'Cầu lông', 'Tennis', 'Bóng chuyền', 'Bóng rổ']),
        icon: 'court-icon',
        huyen: district,
        thanh_pho: province,
        dia_chi_cu_the: generateRandomAddress(),
        mo_ta: generateDescription(10),
        hinh_anh: `https://via.placeholder.com/400?text=Court${i}`,
        gio_mo_cua: '06:00:00',
        gio_dong_cua: '23:00:00',

        // ✅ CHUẨN HOÁ
        vi_do: gps.longitude,   // longitude
        kinh_do: gps.latitude,  // latitude

        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const batchSize = 100;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await queryInterface.bulkInsert('santhethaos', batch);
      console.log(`✓ Seeded ${i + batch.length}/${records.length}`);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('santhethaos', null, {});
  }
};