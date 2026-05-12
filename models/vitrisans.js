'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vitrisan extends Model {
    static associate(models) {
      // Định nghĩa quan hệ (Foreign Keys)
      Vitrisan.belongsTo(models.Santhethao, { foreignKey: 'id_san' });
      Vitrisan.belongsTo(models.Monchoi, { foreignKey: 'id_mon_choi' });
      Vitrisan.hasMany(models.Datsan, { foreignKey: 'id_vi_tri_dat_san' });
    }

    // Các hàm xử lý logic từ DAO cũ
    static async add(id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang = true) {
      return await this.create({ id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang });
    }

    static async updateRecord(id, id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang) {
      const [, [updated]] = await this.update(
        { id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang },
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

    static async getAll() {
      const query = `
        SELECT vitrisans.*
        FROM vitrisans 
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id
        JOIN monchois ON vitrisans.id_mon_choi = monchois.id
        JOIN chusans ON santhethaos.id_chu_san = chusans.id
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpen() {
      const query = `
        SELECT vitrisans.*, santhethaos.id, santhethaos.ten_san, monchois.id, monchois.ten_mon
        FROM vitrisans 
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id
        JOIN monchois ON vitrisans.id_mon_choi = monchois.id
        JOIN chusans ON santhethaos.id_chu_san = chusans.id
        WHERE vitrisans.tinh_trang = true
      `;
      return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }

    static async getAllOpenSanId(id_san) {
      const query = `
        SELECT vitrisans.id_san, santhethaos.id, vitrisans.id, vitrisans.so_san, monchois.ten_mon
        FROM vitrisans 
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id
        JOIN monchois ON vitrisans.id_mon_choi = monchois.id
        WHERE vitrisans.tinh_trang = true AND vitrisans.id_san = :id_san
      `;
      return await sequelize.query(query, {
        replacements: { id_san },
        type: sequelize.QueryTypes.SELECT
      });
    }

    static async getByChuSanId(id_chu_san) {
      const query = `
        SELECT vitrisans.*
        FROM vitrisans 
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id
        WHERE santhethaos.id_chu_san = :id_chu_san AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, {
        replacements: { id_chu_san },
        type: sequelize.QueryTypes.SELECT
      });
    }

    static async getByNhanVienId(id_nhan_vien) {
      const query = `
        SELECT vitrisans.*
        FROM vitrisans 
        JOIN santhethaos ON vitrisans.id_san = santhethaos.id
        JOIN nhanviens ON santhethaos.id = nhanviens.id_san
        WHERE nhanviens.id = :id_nhan_vien AND santhethaos.tinh_trang = true
      `;
      return await sequelize.query(query, {
        replacements: { id_nhan_vien },
        type: sequelize.QueryTypes.SELECT
      });
    }
  }

  Vitrisan.init({
    id_san: DataTypes.INTEGER,
    id_mon_choi: DataTypes.INTEGER,
    so_san: DataTypes.INTEGER,
    gia_san: DataTypes.INTEGER,
    mo_ta: DataTypes.STRING,
    tinh_trang: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Vitrisan',
    tableName: 'vitrisans',
    indexes: [
      { name: 'idx_vitrisans_san', fields: ['id_san'] },
      { name: 'idx_vitrisans_mon_choi', fields: ['id_mon_choi'] }
    ]
  });

  return Vitrisan;
};