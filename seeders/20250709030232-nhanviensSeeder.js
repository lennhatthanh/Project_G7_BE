'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashed = await bcrypt.hash('123456',10);
    await queryInterface.bulkInsert("nhanviens", [
      {
        id_san:1,
        ho_ten: "Nguyễn Văn A",
        email: "a@example.com",
        so_dien_thoai: "0123456789",
        mat_khau: hashed,
        gioi_tinh: "Nam",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_san:2,
        ho_ten: "Nguyễn Văn B",
        email: "b@example.com",
        so_dien_thoai: "0987654321",
        mat_khau: hashed,
        gioi_tinh: "Nam",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_san:3,
        ho_ten: "Nguyễn Văn C",
        email: "c@example.com",
        so_dien_thoai: "0123321123",
        mat_khau: hashed,
        gioi_tinh: "Nam",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("nhanviens", null, {});
  },
};
