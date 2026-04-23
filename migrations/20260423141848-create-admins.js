'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admins', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      ho_ten: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      mat_khau: { type: Sequelize.STRING, allowNull: false },
      so_dien_thoai: { type: Sequelize.STRING, allowNull: false },
      gioi_tinh: { type: Sequelize.ENUM('Nam', 'Nữ', 'Khác'), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('admins', ['email']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admins');
  }
};