'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('danhgias', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_vi_tri_san: { type: Sequelize.INTEGER, references: { model: 'vitrisans', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      id_nguoi_dung: { type: Sequelize.INTEGER, references: { model: 'nguoidungs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      so_sao: { type: Sequelize.INTEGER, allowNull: false },
      danh_gia: { type: Sequelize.STRING, allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('danhgias', ['id_vi_tri_san']);
    await queryInterface.addIndex('danhgias', ['id_nguoi_dung']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('danhgias');
  }
};