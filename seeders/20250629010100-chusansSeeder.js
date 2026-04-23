"use strict";
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashed = await bcrypt.hash('123456',10);
    await queryInterface.bulkInsert("chusans", [
      {
        ho_ten: "Nguyễn Văn A",
        email: "a@example.com",
        mat_khau: hashed,
        so_dien_thoai: "0909123456",
        gioi_tinh: "Nam",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ho_ten: "Trần Thị B",
        email: "b@example.com",
        mat_khau: hashed,
        so_dien_thoai: "0912233445",
        gioi_tinh: "Nữ",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ho_ten: "Lê Văn C",
        email: "c@example.com",
        mat_khau: hashed,
        so_dien_thoai: "0933456789",
        gioi_tinh: "Nam",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ho_ten: "Phạm Thị D",
        email: "d@example.com",
        mat_khau: hashed,
        so_dien_thoai: "0945678901",
        gioi_tinh: "Khác",
        tinh_trang: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("chusans", null, {});
  },
};
