'use strict';
const { Model, QueryTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dichvu extends Model {

    static associate(models) {
      Dichvu.belongsTo(models.Santhethao, { foreignKey: 'id_san' });
      Dichvu.hasMany(models.Datsandichvu, { foreignKey: 'id_dich_vu' });
    }

    // CREATE
    static async add(id_san, ten_dich_vu, mo_ta, don_gia) {
      return await this.create({
        id_san,
        ten_dich_vu,
        mo_ta,
        don_gia
      });
    }

    // UPDATE (FIX RETURN)
    static async updateRecord(id, payload) {
      await this.update(payload, {
        where: { id }
      });

      return await this.findByPk(id);
    }

    // DELETE
    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (!record) return null;
      await record.destroy();
      return record;
    }

    // GET BY CHU SAN (RAW QUERY FIXED)
    static async getAll(id_chu_san) {
      const query = `
        SELECT d.*, s.id_chu_san
        FROM dichvus d
        JOIN santhethaos s ON d.id_san = s.id
        WHERE s.id_chu_san = :id_chu_san
          AND s.tinh_trang = true
      `;

      return await sequelize.query(query, {
        replacements: { id_chu_san: Number(id_chu_san) },
        type: QueryTypes.SELECT
      });
    }

    // GET BY SAN
    static async getAllOpenById(id_san) {
      const query = `
        SELECT *
        FROM dichvus
        WHERE id_san = :id_san
          AND tinh_trang = true
      `;

      return await sequelize.query(query, {
        replacements: { id_san: Number(id_san) },
        type: QueryTypes.SELECT
      });
    }

    // GET ALL OPEN
    static async getAllOpen() {
      const query = `
        SELECT d.*
        FROM dichvus d
        JOIN santhethaos s ON d.id_san = s.id
        WHERE d.tinh_trang = true
          AND s.tinh_trang = true
      `;

      return await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
    }
  }

  Dichvu.init({
    id_san: DataTypes.INTEGER,
    ten_dich_vu: DataTypes.STRING,
    mo_ta: DataTypes.STRING,
    don_gia: DataTypes.NUMERIC,
    tinh_trang: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Dichvu',
    tableName: 'dichvus',
    timestamps: true,
    indexes: [
      { fields: ['id_san'] }
    ]
  });

  return Dichvu;
};