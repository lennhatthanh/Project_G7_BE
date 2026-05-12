'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nhanviens', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_san: { type: Sequelize.INTEGER, references: { model: 'santhethaos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      ho_ten: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      so_dien_thoai: { type: Sequelize.STRING, unique: true, allowNull: false },
      mat_khau: { type: Sequelize.STRING, allowNull: false },
      gioi_tinh: { type: Sequelize.ENUM('Nam', 'Nữ', 'Khác'), allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('nhanviens', ['email']);
    await queryInterface.addIndex('nhanviens', ['id_san']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nhanviens');
  }
};