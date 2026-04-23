"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("santhethaos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_chu_san: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'chusans', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
      },
      ten_san: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      loai_san: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      huyen: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      thanh_pho: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dia_chi_cu_the: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mo_ta: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      hinh_anh: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gio_mo_cua: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      gio_dong_cua: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      kinh_do: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vi_do: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tinh_trang: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("santhethaos");
  },
};
