'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nguoidungs', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      ho_ten: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING, unique: true },
      so_dien_thoai: { type: Sequelize.STRING, unique: true },
      mat_khau: { type: Sequelize.STRING },
      gioi_tinh: { type: Sequelize.ENUM('Nam', 'Nữ', 'Khác') },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('nguoidungs', ['email']);
    await queryInterface.addIndex('nguoidungs', ['so_dien_thoai']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nguoidungs');
  }
};