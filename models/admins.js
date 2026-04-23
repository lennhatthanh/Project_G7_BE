'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static async getByEmail(email) {
      const data = await this.findOne({ where: { email } });
      return { rows: data ? [data] : [], rowCount: data ? 1 : 0 };
    }
  }

  Admin.init({
    ho_ten: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    mat_khau: DataTypes.STRING,
    so_dien_thoai: DataTypes.STRING,
    gioi_tinh: DataTypes.ENUM('Nam', 'Nữ', 'Khác')
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    indexes: [
      { unique: true, fields: ['email'], name: 'idx_admins_email' }
    ]
  });
  return Admin;
};