"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("dichvus", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_san: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ten_dich_vu: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mo_ta: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      don_gia: {
        type: Sequelize.NUMERIC,
        allowNull: false,
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
    await queryInterface.dropTable("dichvus");
  },
};
