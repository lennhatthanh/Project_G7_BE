'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('datsans', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_vi_tri_dat_san: {
        type: Sequelize.INTEGER,
        references: { model: 'vitrisans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_nguoi_dung: {
        type: Sequelize.INTEGER,
        references: { model: 'nguoidungs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ngay_dat: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      gio_dat: {
        type: Sequelize.TIME,
        allowNull: false
      },
      thanh_tien: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      orderCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tinh_trang: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Tạo Index tối ưu
    await queryInterface.addIndex('datsans', ['orderCode'], { unique: true, name: 'idx_datsans_order_code' });
    await queryInterface.addIndex('datsans', ['id_nguoi_dung'], { name: 'idx_datsans_user' });
    await queryInterface.addIndex('datsans', ['ngay_dat', 'id_vi_tri_dat_san'], { name: 'idx_datsans_schedule_lookup' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('datsans');
  }
};