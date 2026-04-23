'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const hashed = await bcrypt.hash('123456',10);
    await queryInterface.bulkInsert('nguoidungs', [
      {
        ho_ten: "Nguyễn Văn A",
        email: "a.nguyen@example.com",
        so_dien_thoai: "0912345678",
        mat_khau: hashed,
        gioi_tinh: "Nam",
        is_verified: true,
        tinh_trang: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        ho_ten: "Trần Thị B",
        email: "b.tran@example.com",
        so_dien_thoai: "0923456789",
        mat_khau: hashed,
        gioi_tinh: "Nữ",
        is_verified: false,
        tinh_trang: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        ho_ten: "Lê Văn C",
        email: "c.le@example.com",
        so_dien_thoai: "0934567890",
        mat_khau: hashed,
        gioi_tinh: "Nam",
        is_verified: true,
        tinh_trang: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        ho_ten: "Phạm Thị D",
        email: "d.pham@example.com",
        so_dien_thoai: "0945678901",
        mat_khau: hashed,
        gioi_tinh: "Nữ",
        is_verified: false,
        tinh_trang: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        ho_ten: "Hoàng Minh E",
        email: "e.hoang@example.com",
        so_dien_thoai: "0956789012",
        mat_khau: hashed,
        gioi_tinh: "Khác",
        is_verified: true,
        tinh_trang: true,
        createdAt: now,
        updatedAt: now,
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('nguoidungs', null, {});
  }
};
