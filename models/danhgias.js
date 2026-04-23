'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Danhgia extends Model {
    static associate(models) {
      Danhgia.belongsTo(models.Vitrisan, { foreignKey: 'id_vi_tri_san' });
      Danhgia.belongsTo(models.Nguoidung, { foreignKey: 'id_nguoi_dung' });
    }

    static async add(id_vi_tri_san, id_nguoi_dung, so_sao, danh_gia) {
      return await this.create({ id_vi_tri_san, id_nguoi_dung, so_sao, danh_gia });
    }

    static async updateRecord(id, so_sao, danh_gia, tinh_trang) {
      const [, [updated]] = await this.update(
        { so_sao, danh_gia, tinh_trang },
        { where: { id }, returning: true }
      );
      return updated;
    }

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) await record.destroy();
      return record;
    }

    static async getAll() {
      const query = `
        SELECT danhgias.*, nguoidungs.ho_ten, santhethaos.id AS id_san
        FROM danhgias 
        JOIN vitrisans ON danhgias.id_vi_tri_san = vitrisans.id
        JOIN nguoidungs ON danhgias.id_nguoi_dung = nguoidungs.id
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen() {
      const query = `
        SELECT danhgias.*, nguoidungs.ho_ten, nguoidungs.tinh_trang AS tinh_trang_nguoi_dung, 
               vitrisans.tinh_trang AS tinh_trang_vi_tri
        FROM danhgias 
        JOIN vitrisans ON danhgias.id_vi_tri_san = vitrisans.id
        JOIN nguoidungs ON danhgias.id_nguoi_dung = nguoidungs.id
        WHERE danhgias.tinh_trang = true
        AND nguoidungs.tinh_trang = true
        AND vitrisans.tinh_trang = true
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }
  }

  Danhgia.init({
    id_vi_tri_san: DataTypes.INTEGER,
    id_nguoi_dung: DataTypes.INTEGER,
    so_sao: DataTypes.INTEGER,
    danh_gia: DataTypes.STRING,
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Danhgia',
    tableName: 'danhgias',
    indexes: [
      { fields: ['id_vi_tri_san'], name: 'idx_danhgias_vitri' },
      { fields: ['id_nguoi_dung'], name: 'idx_danhgias_nguoidung' }
    ]
  });
  return Danhgia;
};