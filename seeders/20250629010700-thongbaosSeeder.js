'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('thongbaos', [
      {
        id_san: 1,
        tieu_de: 'Bảo trì sân A',
        noi_dung: 'Sân A sẽ được bảo trì vào ngày 25/07. Vui lòng không đặt sân vào thời gian này.',
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_san: 2,
        tieu_de: 'Giải đấu mùa hè',
        noi_dung: 'Giải đấu bóng đá mùa hè sẽ diễn ra vào đầu tháng 8. Đăng ký tại quầy lễ tân.',
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_san: null,
        tieu_de: 'Thông báo hệ thống',
        noi_dung: 'Hệ thống sẽ được bảo trì định kỳ vào mỗi thứ Hai hàng tuần từ 1:00 - 3:00 sáng.',
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('thongbaos', null, {});
  }
};
