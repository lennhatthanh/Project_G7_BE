'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Nhanvien extends Model {
    static associate(models) {
      Nhanvien.belongsTo(models.Santhethao, { foreignKey: 'id_san' });
    }

    static async add(id_san, ho_ten, email, hashed, so_dien_thoai, gioi_tinh) {
      return await this.create({ id_san, ho_ten, email, mat_khau: hashed, so_dien_thoai, gioi_tinh });
    }

    static async updateRecord(id, id_san, ho_ten, email, hashed, so_dien_thoai, gioi_tinh, tinh_trang) {
      const [, [updated]] = await this.update(
        { id_san, ho_ten, mat_khau: hashed, email, so_dien_thoai, gioi_tinh, tinh_trang },
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

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) await record.destroy();
      return record;
    }

    static async changeMatKhau(id, hashed) {
      return await this.update({ mat_khau: hashed }, { where: { id } });
    }

    static async getAll() {
      const query = `
        SELECT nhanviens.*, santhethaos.ten_san, chusans.ho_ten as ho_ten_chu_san
        FROM nhanviens 
        JOIN santhethaos ON nhanviens.id_san = santhethaos.id
        JOIN chusans ON chusans.id = santhethaos.id_chu_san
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getByEmail(email) {
      const data = await this.findOne({ where: { email } });
      return { rows: data ? [data] : [], rowCount: data ? 1 : 0 };
    }

    static async getById(id) {
      return await this.findByPk(id);
    }

    static async getByChuSan(id_chu_san) {
      const query = `
        SELECT nhanviens.*, santhethaos.ten_san
        FROM nhanviens 
        JOIN santhethaos ON nhanviens.id_san = santhethaos.id
        JOIN chusans ON chusans.id = santhethaos.id_chu_san
        WHERE chusans.id = :id_chu_san AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, {
        replacements: { id_chu_san },
        type: sequelize.QueryTypes.SELECT
      });
    }
  }

  Nhanvien.init({
    id_san: DataTypes.INTEGER,
    ho_ten: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    mat_khau: DataTypes.STRING,
    so_dien_thoai: { type: DataTypes.STRING, unique: true },
    gioi_tinh: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Nhanvien',
    tableName: 'nhanviens',
    indexes: [
      { unique: true, fields: ['email'], name: 'idx_nhanviens_email' },
      { fields: ['id_san'], name: 'idx_nhanviens_san' }
    ]
  });
  return Nhanvien;
};