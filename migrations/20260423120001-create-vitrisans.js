'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vitrisans', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_san: {
        type: Sequelize.INTEGER,
        references: { model: 'santhethaos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_mon_choi: {
        type: Sequelize.INTEGER,
        references: { model: 'monchois', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      so_san: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gia_san: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      mo_ta: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tinh_trang: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.addIndex('vitrisans', ['id_san'], { name: 'idx_vitrisans_san' });
    await queryInterface.addIndex('vitrisans', ['id_mon_choi'], { name: 'idx_vitrisans_mon_choi' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vitrisans');
  }
};