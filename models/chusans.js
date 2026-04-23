'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chusan extends Model {
    static associate(models) {
      Chusan.hasMany(models.Santhethao, { foreignKey: 'id_chu_san' });
    }

    static async add(ho_ten, email, hashed, so_dien_thoai, gioi_tinh) {
      return await this.create({ ho_ten, email, mat_khau: hashed, so_dien_thoai, gioi_tinh });
    }

    static async updateRecord(id, ho_ten, email, hashed, so_dien_thoai, gioi_tinh, tinh_trang) {
      const [, [updated]] = await this.update(
        { ho_ten, mat_khau: hashed, email, so_dien_thoai, gioi_tinh, tinh_trang },
        { where: { id }, returning: true }
      );
      return updated;
    }

    static async updateOpen(id, ho_ten, so_dien_thoai, gioi_tinh, tinh_trang) {
      const [, [updated]] = await this.update(
        { ho_ten, so_dien_thoai, gioi_tinh, tinh_trang },
        { where: { id }, returning: true }
      );
      return updated;
    }

    static async changeMatKhau(id, hashed) {
      return await this.update({ mat_khau: hashed }, { where: { id } });
    }

    static async getById(id) {
      return await this.findByPk(id);
    }

    static async getByEmail(email) {
      const data = await this.findOne({ where: { email } });
      return { rows: data ? [data] : [], rowCount: data ? 1 : 0 };
    }

    static async getAll() {
      return await this.findAll();
    }

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) await record.destroy();
      return record;
    }
  }

  Chusan.init({
    ho_ten: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    mat_khau: DataTypes.STRING,
    so_dien_thoai: { type: DataTypes.STRING, unique: true },
    gioi_tinh: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Chusan',
    tableName: 'chusans',
    indexes: [
      { unique: true, fields: ['email'], name: 'idx_chusans_email' },
      { unique: true, fields: ['so_dien_thoai'], name: 'idx_chusans_phone' }
    ]
  });
  return Chusan;
};