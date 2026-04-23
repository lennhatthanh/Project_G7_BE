'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashed = await bcrypt.hash('123456',10);
    await queryInterface.bulkInsert('admins', [{
      ho_ten: 'Trần Lê Đức Tính',
      email: 'tranleductinh@gmail.com',
      mat_khau: hashed,
      so_dien_thoai: '0909123456',
      gioi_tinh: 'Nam',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', {email: "tranleductinh@gmail.com"}, {});
  }
};
