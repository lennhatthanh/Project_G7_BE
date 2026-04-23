'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('datsans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_vi_tri_dat_san: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vitrisans', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
      },
      id_nguoi_dung: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'nguoidungs', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
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
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('datsans');
  }
};