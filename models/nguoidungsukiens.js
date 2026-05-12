'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Nguoidungsukien extends Model {
    static associate(models) {
      Nguoidungsukien.belongsTo(models.Nguoidung, { foreignKey: 'id_nguoi_dung' });
      Nguoidungsukien.belongsTo(models.Sukien, { foreignKey: 'id_su_kien' });
    }

    static async add(id_nguoi_dung, id_su_kien, can_cuoc_cong_dan, orderCode) {
      return await this.create({ id_nguoi_dung, id_su_kien, can_cuoc_cong_dan, orderCode });
    }

    static async updateRecord(orderCode) {
      const [, [updated]] = await this.update(
        { phe_duyet: true },
        { where: { orderCode }, returning: true }
      );
      return updated;
    }

    static async deleteRecord(orderCode) {
      const record = await this.findOne({ where: { orderCode, phe_duyet: false } });
      if (record) await record.destroy();
      return record;
    }

    static async getAll() {
      const query = `
        SELECT nguoidungsukiens.*, nguoidungs.ho_ten, nguoidungs.tinh_trang AS tinh_trang_user, 
               sukiens.ten_su_kien, sukiens.id_san, santhethaos.ten_san
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen() {
      const query = `
        SELECT nguoidungsukiens.*, nguoidungs.ho_ten, nguoidungs.tinh_trang AS tinh_trang_user, 
               sukiens.ten_su_kien, sukiens.id_san, sukiens.tinh_trang AS tinh_trang_sukien, santhethaos.ten_san
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san
        WHERE sukiens.tinh_trang = true
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getAllByNhanVien(id_nhan_vien) {
      const query = `
        SELECT nguoidungsukiens.*, nguoidungs.ho_ten, nguoidungs.tinh_trang AS tinh_trang_user, 
               sukiens.ten_su_kien, sukiens.id_san, santhethaos.ten_san, nhanviens.id AS id_nhan_vien
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san
        JOIN nhanviens ON santhethaos.id = nhanviens.id_san
        WHERE nhanviens.id = :id_nhan_vien
      `;
      return await sequelize.query(query, { replacements: { id_nhan_vien }, type: sequelize.QueryTypes.SELECT });
    }

    static async getAllByChuSan(id_chu_san) {
      const query = `
        SELECT nguoidungsukiens.*, nguoidungs.ho_ten, nguoidungs.tinh_trang AS tinh_trang_user, 
               sukiens.ten_su_kien, sukiens.id_san, santhethaos.ten_san
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san
        WHERE santhethaos.id_chu_san = :id_chu_san
      `;
      return await sequelize.query(query, { replacements: { id_chu_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async checkSoLuong(id_su_kien) {
      const query = `SELECT COALESCE(COUNT(*), 0) AS so_luong FROM nguoidungsukiens WHERE id_su_kien = :id_su_kien`;
      const result = await sequelize.query(query, { replacements: { id_su_kien }, type: sequelize.QueryTypes.SELECT });
      return result[0];
    }
  }

  Nguoidungsukien.init({
    id_nguoi_dung: DataTypes.INTEGER,
    id_su_kien: DataTypes.INTEGER,
    can_cuoc_cong_dan: DataTypes.STRING,
    orderCode: DataTypes.STRING,
    phe_duyet: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'Nguoidungsukien',
    tableName: 'nguoidungsukiens',
    indexes: [
      { unique: true, fields: ['orderCode'], name: 'idx_nguoidungsukiens_order' },
      { fields: ['id_nguoi_dung'], name: 'idx_nguoidungsukiens_user' },
      { fields: ['id_su_kien'], name: 'idx_nguoidungsukiens_event' }
    ]
  });
  return Nguoidungsukien;
};