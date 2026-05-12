'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Thongbao extends Model {
    static associate(models) {
      Thongbao.belongsTo(models.Santhethao, { foreignKey: 'id_san' });
    }

    static async add(id_san, tieu_de, noi_dung, tinh_trang = true) {
      return await this.create({ id_san, tieu_de, noi_dung, tinh_trang });
    }

    static async updateRecord(id, tieu_de, noi_dung, tinh_trang, id_san) {
      const [, [updated]] = await this.update(
        { tieu_de, noi_dung, tinh_trang, id_san },
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
        SELECT thongbaos.*, santhethaos.ten_san
        FROM thongbaos 
        JOIN santhethaos ON thongbaos.id_san = santhethaos.id 
        WHERE santhethaos.id_chu_san = :id_chu_san AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, { replacements: { id_chu_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen() {
      const query = `
        SELECT thongbaos.*, santhethaos.ten_san, santhethaos.tinh_trang
        FROM thongbaos 
        JOIN santhethaos ON thongbaos.id_san = santhethaos.id
        WHERE thongbaos.tinh_trang = true AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpenThongBao(id_san) {
      const query = `
        SELECT thongbaos.*, santhethaos.ten_san, santhethaos.tinh_trang
        FROM thongbaos 
        JOIN santhethaos ON thongbaos.id_san = santhethaos.id
        WHERE thongbaos.tinh_trang = true AND santhethaos.tinh_trang = true AND thongbaos.id_san = :id_san
      `;
      return await sequelize.query(query, { replacements: { id_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async layEmail(id_san) {
      const query = `
        SELECT DISTINCT nguoidungs.id, nguoidungs.email
        FROM nguoidungs 
        JOIN datsans ON nguoidungs.id = datsans.id_nguoi_dung
        JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_dat_san
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id
        WHERE santhethaos.id = :id_san AND nguoidungs.is_verified = true
      `;
      return await sequelize.query(query, { replacements: { id_san }, type: sequelize.QueryTypes.SELECT });
    }
  }

  Thongbao.init({
    id_san: DataTypes.INTEGER,
    tieu_de: DataTypes.STRING,
    noi_dung: DataTypes.STRING,
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Thongbao',
    tableName: 'thongbaos',
    indexes: [{ fields: ['id_san'], name: 'idx_thongbaos_san' }]
  });
  return Thongbao;
};