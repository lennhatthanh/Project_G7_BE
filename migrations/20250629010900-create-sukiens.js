'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sukiens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_san: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'santhethaos', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
      },
      ten_su_kien: {
        type: Sequelize.STRING,
        allowNull: false
      },
      noi_dung: {
        type: Sequelize.STRING,
        allowNull: false
      },
      thoi_gian_bat_dau: {
        type: Sequelize.DATE,
        allowNull: false
      },
      thoi_gian_ket_thuc: {
        type: Sequelize.DATE,
        allowNull: false
      },
      so_luong: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      phi_tham_gia: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tinh_trang: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sukiens');
  }
};