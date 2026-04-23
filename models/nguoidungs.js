'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Nguoidung extends Model {
    static associate(models) {
      Nguoidung.hasMany(models.Datsan, { foreignKey: 'id_nguoi_dung' });
      Nguoidung.hasMany(models.Danhgia, { foreignKey: 'id_nguoi_dung' });
    }

    // Logic DAO cũ chuyển thành Static Methods
    static async add(ho_ten, email, hashed, so_dien_thoai, gioi_tinh) {
      return await this.create({ ho_ten, email, mat_khau: hashed, so_dien_thoai, gioi_tinh });
    }

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) await record.destroy();
      return record;
    }

    static async verify(email) {
      return await this.update({ is_verified: true }, { where: { email } });
    }

    static async updateRecord(id, ho_ten, email, hashed, so_dien_thoai, gioi_tinh, tinh_trang) {
      const [, [updated]] = await this.update(
        { ho_ten, mat_khau: hashed, email, so_dien_thoai, gioi_tinh, tinh_trang },
        { where: { id }, returning: true }
      );
      return updated;
    }

    static async updateOpen(id, ho_ten, so_dien_thoai, gioi_tinh) {
      const [, [updated]] = await this.update(
        { ho_ten, so_dien_thoai, gioi_tinh },
        { where: { id }, returning: true }
      );
      return updated;
    }

    static async changeMatKhau(id, hashed) {
      return await this.update({ mat_khau: hashed }, { where: { id } });
    }

    static async getAll() {
      return await this.findAll();
    }

    static async getByEmail(email) {
      // Trả về định dạng giống query cũ để không break logic xử lý row
      const data = await this.findOne({ where: { email } });
      return { rows: data ? [data] : [], rowCount: data ? 1 : 0 };
    }

    static async getById(id) {
      return await this.findByPk(id);
    }
  }

  Nguoidung.init({
    ho_ten: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    mat_khau: DataTypes.STRING,
    so_dien_thoai: { type: DataTypes.STRING, unique: true },
    gioi_tinh: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Nguoidung',
    tableName: 'nguoidungs',
    indexes: [
      { unique: true, fields: ['email'], name: 'idx_nguoidungs_email' },
      { unique: true, fields: ['so_dien_thoai'], name: 'idx_nguoidungs_phone' }
    ]
  });
  return Nguoidung;
};