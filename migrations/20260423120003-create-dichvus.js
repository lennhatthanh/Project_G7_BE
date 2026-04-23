'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dichvus', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_san: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'santhethaos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      ten_dich_vu: { type: Sequelize.STRING, allowNull: false },
      mo_ta: { type: Sequelize.STRING, allowNull: false },
      don_gia: { type: Sequelize.NUMERIC, allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('dichvus', ['id_san'], { name: 'idx_dichvus_san' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dichvus');
  }
};