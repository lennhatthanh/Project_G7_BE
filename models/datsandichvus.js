'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Datsandichvu extends Model {
    static associate(models) {
      Datsandichvu.belongsTo(models.Datsan, { foreignKey: 'id_dat_san' });
      Datsandichvu.belongsTo(models.Dichvu, { foreignKey: 'id_dich_vu' });
    }

    static async add(id_dich_vu, id_dat_san) {
      return await this.create({ id_dich_vu, id_dat_san });
    }

    static async updateRecord(id, id_dich_vu, id_dat_san) {
      const [, [updated]] = await this.update(
        { id_dich_vu, id_dat_san },
        { where: { id }, returning: true }
      );
      return updated;
    }

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) {
        await record.destroy();
      }
      return record;
    }
  }

  Datsandichvu.init({
    id_dich_vu: DataTypes.INTEGER,
    id_dat_san: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Datsandichvu',
    tableName: 'datsandichvus',
    indexes: [
      { name: 'idx_datsandichvus_booking', fields: ['id_dat_san'] },
      { name: 'idx_datsandichvus_service', fields: ['id_dich_vu'] }
    ]
  });

  return Datsandichvu;
};