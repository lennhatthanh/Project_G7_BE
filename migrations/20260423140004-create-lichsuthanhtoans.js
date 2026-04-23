'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lichsuthanhtoans', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_dat_san: { type: Sequelize.INTEGER, references: { model: 'datsans', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      phuong_thuc: { type: Sequelize.ENUM('Chuyển Khoản'), allowNull: false },
      thanh_tien: { type: Sequelize.STRING, allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('lichsuthanhtoans', ['id_dat_san']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lichsuthanhtoans');
  }
};