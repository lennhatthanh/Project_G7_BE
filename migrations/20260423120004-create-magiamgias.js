'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('magiamgias', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_san: { type: Sequelize.INTEGER, references: { model: 'santhethaos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      ma_giam_gia: { type: Sequelize.STRING, allowNull: false },
      gia_tri_giam: { type: Sequelize.DOUBLE, allowNull: false },
      mo_ta: { type: Sequelize.STRING, allowNull: false },
      loai_giam_gia: { type: Sequelize.ENUM('Phần Trăm', 'Tiền Mặt'), allowNull: false },
      ngay_bat_dau: { type: Sequelize.DATE, allowNull: false },
      ngay_ket_thuc: { type: Sequelize.DATE, allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('magiamgias', ['ma_giam_gia', 'id_san'], { name: 'idx_magiamgias_ma' });
    await queryInterface.addIndex('magiamgias', ['ngay_bat_dau', 'ngay_ket_thuc'], { name: 'idx_magiamgias_date' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('magiamgias');
  }
};