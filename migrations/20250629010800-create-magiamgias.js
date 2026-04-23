'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('magiamgias', {
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
      ma_giam_gia: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gia_tri_giam: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      mo_ta: {
        type: Sequelize.STRING,
        allowNull: false
      },
      loai_giam_gia: {
        type: Sequelize.ENUM('Phần Trăm','Tiền Mặt'),
        allowNull: false
      },
      ngay_bat_dau: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ngay_ket_thuc: {
        type: Sequelize.DATE,
        allowNull: false
      },
      tinh_trang: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('magiamgias');
  }
};