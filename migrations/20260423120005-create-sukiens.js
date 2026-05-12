'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sukiens', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_san: { type: Sequelize.INTEGER, references: { model: 'santhethaos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      ten_su_kien: { type: Sequelize.STRING, allowNull: false },
      noi_dung: { type: Sequelize.STRING, allowNull: false },
      thoi_gian_bat_dau: { type: Sequelize.DATE, allowNull: false },
      thoi_gian_ket_thuc: { type: Sequelize.DATE, allowNull: false },
      so_luong: { type: Sequelize.INTEGER, allowNull: false },
      phi_tham_gia: { type: Sequelize.INTEGER, allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('sukiens', ['id_san'], { name: 'idx_sukiens_san' });
    await queryInterface.addIndex('sukiens', ['thoi_gian_bat_dau', 'thoi_gian_ket_thuc'], { name: 'idx_sukiens_date' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sukiens');
  }
};