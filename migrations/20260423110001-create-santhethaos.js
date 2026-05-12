'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('santhethaos', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      id_chu_san: { type: Sequelize.INTEGER, references: { model: 'chusans', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      ten_san: { type: Sequelize.STRING },
      loai_san: { type: Sequelize.STRING },
      icon: { type: Sequelize.STRING },
      huyen: { type: Sequelize.STRING },
      thanh_pho: { type: Sequelize.STRING },
      dia_chi_cu_the: { type: Sequelize.STRING },
      mo_ta: { type: Sequelize.STRING },
      hinh_anh: { type: Sequelize.STRING },
      gio_mo_cua: { type: Sequelize.TIME },
      gio_dong_cua: { type: Sequelize.TIME },
      kinh_do: { type: Sequelize.STRING },
      vi_do: { type: Sequelize.STRING },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('santhethaos', ['id_chu_san'], { name: 'idx_santhethaos_chusan' });
    await queryInterface.addIndex('santhethaos', ['thanh_pho', 'huyen'], { name: 'idx_santhethaos_diachi' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('santhethaos');
  }
};