'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Monchoi extends Model {
    static associate(models) {
      Monchoi.hasMany(models.Vitrisan, { foreignKey: 'id_mon_choi' });
    }

    static async add(ten_mon, mo_ta) {
      return await this.create({ ten_mon, mo_ta });
    }

    static async updateRecord(id, ten_mon, mo_ta, tinh_trang) {
      const [, [updated]] = await this.update(
        { ten_mon, mo_ta, tinh_trang },
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
      return await this.findAll();
    }

    static async getAllOpen() {
      return await this.findAll({ where: { tinh_trang: true } });
    }
  }

  Monchoi.init({
    ten_mon: DataTypes.STRING,
    mo_ta: DataTypes.STRING,
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Monchoi',
    tableName: 'monchois'
  });
  return Monchoi;
};