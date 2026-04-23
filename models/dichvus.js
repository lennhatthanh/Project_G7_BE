'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dichvu extends Model {
    static associate(models) {
      Dichvu.belongsTo(models.Santhethao, { foreignKey: 'id_san' });
      Dichvu.hasMany(models.Datsandichvu, { foreignKey: 'id_dich_vu' });
    }

    static async add(id_san, ten_dich_vu, mo_ta, don_gia) {
      return await this.create({ id_san, ten_dich_vu, mo_ta, don_gia });
    }

    static async updateRecord(id, id_san, ten_dich_vu, mo_ta, don_gia, tinh_trang) {
      const [, [updated]] = await this.update(
        { id_san, ten_dich_vu, mo_ta, don_gia, tinh_trang },
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
        SELECT dichvus.*, santhethaos.id_chu_san
        FROM dichvus 
        JOIN santhethaos ON dichvus.id_san = santhethaos.id 
        WHERE santhethaos.id_chu_san = :id_chu_san AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, { replacements: { id_chu_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpenById(id_san) {
      const query = `
        SELECT dichvus.*
        FROM dichvus 
        JOIN santhethaos ON dichvus.id_san = santhethaos.id 
        WHERE dichvus.id_san = :id_san AND dichvus.tinh_trang = true
      `;
      return await sequelize.query(query, { replacements: { id_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen() {
      const query = `
        SELECT dichvus.*
        FROM dichvus 
        JOIN santhethaos ON dichvus.id_san = santhethaos.id 
        WHERE dichvus.tinh_trang = true AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }
  }

  Dichvu.init({
    id_san: DataTypes.INTEGER,
    ten_dich_vu: DataTypes.STRING,
    mo_ta: DataTypes.STRING,
    don_gia: DataTypes.NUMERIC,
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Dichvu',
    tableName: 'dichvus',
    indexes: [{ fields: ['id_san'], name: 'idx_dichvus_san' }]
  });
  return Dichvu;
};