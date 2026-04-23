'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nhanviens', {
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
              model: "santhethaos",
              key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
      },
      ho_ten: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      so_dien_thoai: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      mat_khau: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gioi_tinh: {
        type: Sequelize.ENUM('Nam', 'Nữ', 'Khác'),
        allowNull: false,
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
    await queryInterface.dropTable('nhanviens');
  }
};