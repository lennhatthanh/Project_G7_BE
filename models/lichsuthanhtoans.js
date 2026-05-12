'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lichsuthanhtoan extends Model {
    static associate(models) {
      Lichsuthanhtoan.belongsTo(models.Datsan, { foreignKey: 'id_dat_san' });
    }

    static async add(id_dat_san, phuong_thuc, thanh_tien, noi_dung) {
      // Vì bảng hiện tại không có cột noi_dung, hàm sẽ bỏ qua noi_dung theo Schema SQL
      return await this.create({ id_dat_san, phuong_thuc, thanh_tien });
    }

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) await record.destroy();
      return record;
    }

    static async getAll() {
      const query = `
        SELECT lichsuthanhtoans.*, datsans."orderCode", datsans.ngay_dat, datsans.gio_dat, 
               nguoidungs.id AS id_nguoi_dung, nguoidungs.ho_ten, 
               vitrisans.so_san, monchois.ten_mon, santhethaos.ten_san
        FROM lichsuthanhtoans
        JOIN datsans ON datsans.id = lichsuthanhtoans.id_dat_san
        JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
        JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_dat_san
        JOIN monchois ON monchois.id = vitrisans.id_mon_choi
        JOIN santhethaos ON santhethaos.id = vitrisans.id_san
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen(id_nguoi_dung) {
      const query = `
        SELECT lichsuthanhtoans.*, datsans."orderCode", datsans.ngay_dat, datsans.gio_dat, 
               nguoidungs.id AS id_nguoi_dung, nguoidungs.ho_ten, 
               vitrisans.so_san, monchois.ten_mon, santhethaos.ten_san
        FROM lichsuthanhtoans
        JOIN datsans ON datsans.id = lichsuthanhtoans.id_dat_san
        JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
        JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_dat_san
        JOIN monchois ON monchois.id = vitrisans.id_mon_choi
        JOIN santhethaos ON santhethaos.id = vitrisans.id_san
        WHERE nguoidungs.id = :id_nguoi_dung AND lichsuthanhtoans.tinh_trang = true
      `;
      return await sequelize.query(query, { replacements: { id_nguoi_dung }, type: sequelize.QueryTypes.SELECT });
    }
  }

  Lichsuthanhtoan.init({
    id_dat_san: DataTypes.INTEGER,
    phuong_thuc: DataTypes.ENUM('Chuyển Khoản'),
    thanh_tien: DataTypes.STRING, // Dựa theo DB_W3.sql thanh_tien là character varying
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Lichsuthanhtoan',
    tableName: 'lichsuthanhtoans',
    indexes: [{ fields: ['id_dat_san'], name: 'idx_lichsuthanhtoans_datsan' }]
  });
  return Lichsuthanhtoan;
};