'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('monchois', {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      ten_mon: { type: Sequelize.STRING, allowNull: false },
      mo_ta: { type: Sequelize.STRING, allowNull: false },
      tinh_trang: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('monchois');
  }
};