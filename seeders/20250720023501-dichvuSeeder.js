"use strict";

/** @type {import('sequelize-cli').Migration} */
const mang = [];
for (let index = 0; index < 12; index++) {
  mang.push({
        id_san: index+1,
        ten_dich_vu: "Phòng tắm",
        mo_ta: "Có phòng tắm cho khách hàng",
        don_gia: "20000",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_san: index+1,
        ten_dich_vu: "Thuê giày thể thao",
        mo_ta: "Giày thể thao sạch sẽ, đủ size cho khách",
        don_gia: "20000",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_san: index+1,
        ten_dich_vu: "Nước uống",
        mo_ta: "Nước suối Lavie 500ml",
        don_gia: "10000",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_san: index+1,
        ten_dich_vu: "Khăn lau",
        mo_ta: "Khăn sạch sẽ, giặt hàng ngày",
        don_gia: "10000",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },)
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("dichvus", mang);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("dichvus", null, {});
  },
};
