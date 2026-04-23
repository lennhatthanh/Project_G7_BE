'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert("monchois", [
      {
        ten_mon: "Bóng đá",
        mo_ta: "Môn thể thao đồng đội với 11 người mỗi đội",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ten_mon: "Bóng chuyền",
        mo_ta: "Môn thể thao đối kháng trên lưới",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ten_mon: "Cầu lông",
        mo_ta: "Môn thể thao chơi với vợt và quả cầu",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("monchois", null, {});
  }
};
