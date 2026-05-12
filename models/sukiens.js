'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sukien extends Model {
    static associate(models) {
      Sukien.belongsTo(models.Santhethao, { foreignKey: 'id_san' });
      // Thêm liên kết nếu bạn đã tạo bảng Nguoidungsukien
      // Sukien.hasMany(models.Nguoidungsukien, { foreignKey: 'id_su_kien' });
    }

    static async add(id_san, ten_su_kien, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong, phi_tham_gia) {
      return await this.create({ id_san, ten_su_kien, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong, phi_tham_gia });
    }

    static async updateRecord(id, id_san, ten_su_kien, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong, tinh_trang) {
      const [, [updated]] = await this.update(
        { id_san, ten_su_kien, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong, tinh_trang },
        { where: { id }, returning: true }
      );
      return updated;
    }

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) await record.destroy();
      return record;
    }

    static async getAll(id_chu_san) {
      const query = `
        SELECT sukiens.*
        FROM sukiens
        JOIN santhethaos ON sukiens.id_san = santhethaos.id 
        WHERE santhethaos.id_chu_san = :id_chu_san
      `;
      return await sequelize.query(query, { replacements: { id_chu_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen() {
      const query = `
        SELECT sukiens.*, santhethaos.ten_san, sukiens.so_luong - COALESCE(thamgia.so_luong_tham_gia, 0) AS so_luong_tham_gia
        FROM sukiens
        JOIN santhethaos ON sukiens.id_san = santhethaos.id
        LEFT JOIN (
            SELECT id_su_kien, COUNT(*) AS so_luong_tham_gia
            FROM nguoidungsukiens
            GROUP BY id_su_kien
        ) AS thamgia ON thamgia.id_su_kien = sukiens.id
        WHERE COALESCE(thamgia.so_luong_tham_gia, 0) < sukiens.so_luong;
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async checkThamGia(id_nguoi_dung) {
      const query = `SELECT id_su_kien FROM nguoidungsukiens WHERE id_nguoi_dung = :id_nguoi_dung`;
      return await sequelize.query(query, { replacements: { id_nguoi_dung }, type: sequelize.QueryTypes.SELECT });
    }
  }

  Sukien.init({
    id_san: DataTypes.INTEGER,
    ten_su_kien: DataTypes.STRING,
    noi_dung: DataTypes.STRING,
    thoi_gian_bat_dau: DataTypes.DATE,
    thoi_gian_ket_thuc: DataTypes.DATE,
    so_luong: DataTypes.INTEGER,
    phi_tham_gia: DataTypes.INTEGER,
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Sukien',
    tableName: 'sukiens',
    indexes: [
      { fields: ['id_san'], name: 'idx_sukiens_san' },
      { fields: ['thoi_gian_bat_dau', 'thoi_gian_ket_thuc'], name: 'idx_sukiens_date' }
    ]
  });
  return Sukien;
};