'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nguoidungsukiens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      id_su_kien: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sukiens', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
      },
      can_cuoc_cong_dan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phe_duyet: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('nguoidungsukiens');
  }
};