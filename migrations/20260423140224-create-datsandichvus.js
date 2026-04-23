'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('datsandichvus', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_dich_vu: {
        type: Sequelize.INTEGER,
        references: { model: 'dichvus', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_dat_san: {
        type: Sequelize.INTEGER,
        references: { model: 'datsans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('datsandichvus', ['id_dat_san'], { name: 'idx_datsandichvus_booking' });
    await queryInterface.addIndex('datsandichvus', ['id_dich_vu'], { name: 'idx_datsandichvus_service' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('datsandichvus');
  }
};