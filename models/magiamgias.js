'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Magiamgia extends Model {
    static associate(models) {
      Magiamgia.belongsTo(models.Santhethao, { foreignKey: 'id_san' });
    }

    static async add(id_san, ma_giam_gia, gia_tri_giam, mo_ta, loai_giam_gia, ngay_bat_dau, ngay_ket_thuc) {
      return await this.create({ id_san, ma_giam_gia, gia_tri_giam, mo_ta, loai_giam_gia, ngay_bat_dau, ngay_ket_thuc });
    }

    static async updateRecord(ma_giam_gia, gia_tri_giam, mo_ta, loai_giam_gia, ngay_bat_dau, ngay_ket_thuc, tinh_trang, id) {
      const [, [updated]] = await this.update(
        { ma_giam_gia, gia_tri_giam, mo_ta, loai_giam_gia, ngay_bat_dau, ngay_ket_thuc, tinh_trang },
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
        SELECT magiamgias.*
        FROM magiamgias 
        JOIN santhethaos ON magiamgias.id_san = santhethaos.id 
        WHERE santhethaos.id_chu_san = :id_chu_san AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, { replacements: { id_chu_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen() {
      const query = `
        SELECT magiamgias.*, santhethaos.id as id_san, santhethaos.ten_san, santhethaos.tinh_trang as tinh_trang_san
        FROM magiamgias 
        JOIN santhethaos ON magiamgias.id_san = santhethaos.id 
        WHERE magiamgias.tinh_trang = true AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async kiemTraMa(ma_giam_gia, id_san) {
      const query = `
        SELECT magiamgias.gia_tri_giam
        FROM magiamgias
        WHERE ma_giam_gia = :ma_giam_gia AND id_san = :id_san
        AND tinh_trang = true
        AND NOW() BETWEEN ngay_bat_dau AND ngay_ket_thuc;
      `;
      const results = await sequelize.query(query, { 
        replacements: { ma_giam_gia, id_san }, 
        type: sequelize.QueryTypes.SELECT 
      });
      return results[0];
    }
  }

  Magiamgia.init({
    id_san: DataTypes.INTEGER,
    ma_giam_gia: DataTypes.STRING,
    gia_tri_giam: DataTypes.DOUBLE,
    mo_ta: DataTypes.STRING,
    loai_giam_gia: DataTypes.ENUM('Phần Trăm', 'Tiền Mặt'),
    ngay_bat_dau: DataTypes.DATE,
    ngay_ket_thuc: DataTypes.DATE,
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Magiamgia',
    tableName: 'magiamgias',
    indexes: [
      { fields: ['ma_giam_gia', 'id_san'], name: 'idx_magiamgias_ma' },
      { fields: ['ngay_bat_dau', 'ngay_ket_thuc'], name: 'idx_magiamgias_date' }
    ]
  });
  return Magiamgia;
};