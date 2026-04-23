'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('thongbaos', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_san: { type: Sequelize.INTEGER, references: { model: 'santhethaos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      tieu_de: { type: Sequelize.STRING, allowNull: false },
      noi_dung: { type: Sequelize.STRING, allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('thongbaos', ['id_san'], { name: 'idx_thongbaos_san' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('thongbaos');
  }
};