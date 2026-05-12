'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Datsan extends Model {
    static associate(models) {
      Datsan.belongsTo(models.Vitrisan, { foreignKey: 'id_vi_tri_dat_san' });
      Datsan.belongsTo(models.Nguoidung, { foreignKey: 'id_nguoi_dung' });
      Datsan.hasMany(models.Datsandichvu, { foreignKey: 'id_dat_san' });
    }

    static async add(id_vi_tri_dat_san, id_nguoi_dung, ngay_dat, gio_dat, thanh_tien, orderCode) {
      return await this.create({
        id_vi_tri_dat_san, id_nguoi_dung, ngay_dat, gio_dat, thanh_tien, orderCode
      });
    }

    static async getLichSu(id_nguoi_dung) {
      const query = `
        SELECT danhgias.id AS id_danh_gia, datsans.id_vi_tri_dat_san, datsans."orderCode", datsans.ngay_dat, datsans.gio_dat, 
                datsans.thanh_tien, santhethaos.ten_san, santhethaos.huyen, vitrisans.so_san
        FROM datsans 
        JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id
        JOIN santhethaos ON santhethaos.id = vitrisans.id_san 
        LEFT JOIN danhgias ON vitrisans.id = danhgias.id_vi_tri_san
        WHERE datsans.id_nguoi_dung = :id_nguoi_dung
        GROUP BY danhgias.id, datsans.id_vi_tri_dat_san, datsans.ngay_dat, datsans.gio_dat, 
                datsans.thanh_tien, datsans."orderCode", santhethaos.ten_san, santhethaos.huyen, vitrisans.so_san
      `;
      return await sequelize.query(query, {
        replacements: { id_nguoi_dung },
        type: sequelize.QueryTypes.SELECT
      });
    }

    static async getLichSuNhanVien(id_nhan_vien) {
      const query = `
        SELECT datsans.*, nguoidungs.ho_ten, nguoidungs.so_dien_thoai
        FROM datsans 
        JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id 
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id 
        JOIN nhanviens ON santhethaos.id = nhanviens.id_san 
        JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
        WHERE nhanviens.id = :id_nhan_vien
      `;
      return await sequelize.query(query, {
        replacements: { id_nhan_vien },
        type: sequelize.QueryTypes.SELECT
      });
    }

    static async getLichSuChuSan(id_chu_san) {
      const query = `
        SELECT santhethaos.id AS id_san, datsans.*, nguoidungs.ho_ten, nguoidungs.so_dien_thoai
        FROM datsans 
        JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id 
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id 
        JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
        WHERE santhethaos.id_chu_san = :id_chu_san
      `;
      return await sequelize.query(query, {
        replacements: { id_chu_san },
        type: sequelize.QueryTypes.SELECT
      });
    }

    static async deleteRecord(orderCode) {
      const record = await this.findOne({ where: { orderCode, tinh_trang: false } });
      if (record) {
        await record.destroy();
      }
      return record;
    }

    static async deleteNguoiDung(id_nguoi_dung) {
      await sequelize.query(`DELETE FROM nguoidungs WHERE id = :id AND mat_khau IS NULL`, {
        replacements: { id: id_nguoi_dung },
        type: sequelize.QueryTypes.DELETE
      });
    }

    static async updateRecord(orderCode) {
      const [, [updatedRecord]] = await this.update(
        { tinh_trang: true },
        { where: { orderCode }, returning: true }
      );
      return updatedRecord;
    }

    static async layGiaSan(id_vi_tri_san) {
      const query = `SELECT gia_san FROM vitrisans WHERE id = :id_vi_tri_san`;
      const result = await sequelize.query(query, {
        replacements: { id_vi_tri_san },
        type: sequelize.QueryTypes.SELECT
      });
      return result[0];
    }

    static async layGioDat(ngay_dat) {
      const query = `
        SELECT datsans.id_vi_tri_dat_san, datsans.ngay_dat, datsans.gio_dat
        FROM datsans
        JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_dat_san
        WHERE datsans.ngay_dat = :ngay_dat
      `;
      return await sequelize.query(query, {
        replacements: { ngay_dat },
        type: sequelize.QueryTypes.SELECT
      });
    }
  }

  Datsan.init({
    id_vi_tri_dat_san: DataTypes.INTEGER,
    id_nguoi_dung: DataTypes.INTEGER,
    ngay_dat: DataTypes.DATEONLY,
    gio_dat: DataTypes.TIME,
    thanh_tien: DataTypes.INTEGER,
    orderCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tinh_trang: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Datsan',
    tableName: 'datsans',
    indexes: [
      { unique: true, fields: ['orderCode'], name: 'idx_datsans_order_code' },
      { fields: ['id_nguoi_dung'], name: 'idx_datsans_user' },
      { name: 'idx_datsans_schedule_lookup', fields: ['ngay_dat', 'id_vi_tri_dat_san'] }
    ]
  });

  return Datsan;
};