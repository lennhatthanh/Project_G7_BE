'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Santhethao extends Model {
    static associate(models) {
      Santhethao.belongsTo(models.Chusan, { foreignKey: 'id_chu_san' });
      Santhethao.hasMany(models.Vitrisan, { foreignKey: 'id_san' });
      Santhethao.hasMany(models.Dichvu, { foreignKey: 'id_san' });
      Santhethao.hasMany(models.Magiamgia, { foreignKey: 'id_san' });
      Santhethao.hasMany(models.Sukien, { foreignKey: 'id_san' });
      Santhethao.hasMany(models.Thongbao, { foreignKey: 'id_san' });
      Santhethao.hasMany(models.Nhanvien, { foreignKey: 'id_san' });
    }

    static async add(id_chu_san, ten_san, loai_san, icon, huyen, thanh_pho, dia_chi_cu_the, mo_ta, hinh_anh, gio_mo_cua, gio_dong_cua, kinh_do, vi_do) {
      return await this.create({
        id_chu_san, ten_san, loai_san, icon, huyen, thanh_pho, dia_chi_cu_the, mo_ta, hinh_anh, gio_mo_cua, gio_dong_cua, kinh_do, vi_do
      });
    }

    static async updateRecord(id, id_chu_san, ten_san, loai_san, icon, huyen, thanh_pho, dia_chi_cu_the, mo_ta, hinh_anh, gio_mo_cua, gio_dong_cua, kinh_do, vi_do, tinh_trang) {
      const updateData = { ten_san, loai_san, icon, huyen, thanh_pho, dia_chi_cu_the, mo_ta, gio_mo_cua, gio_dong_cua, kinh_do, vi_do, tinh_trang };
      if (hinh_anh !== undefined) updateData.hinh_anh = hinh_anh;
      
      const [, [updated]] = await this.update(updateData, { where: { id }, returning: true });
      return updated;
    }

    static async deleteRecord(id) {
      const record = await this.findByPk(id);
      if (record) await record.destroy();
      return record;
    }

    static async getAllOpen() {
      return await this.findAll({ where: { tinh_trang: true } });
    }

    static async getAllByChuSan(id_chu_san) {
      return await this.findAll({ where: { id_chu_san } });
    }

    static async getAllByChuSanOpen(id_chu_san) {
      return await this.findAll({ where: { id_chu_san, tinh_trang: true } });
    }

    static async getById(id_san) {
      const query = `
        SELECT stt.kinh_do, stt.vi_do, stt.huyen, stt.ten_san, stt.thanh_pho, stt.dia_chi_cu_the, stt.gio_mo_cua, stt.gio_dong_cua,  
                vitrisans.*, monchois.ten_mon
        FROM santhethaos stt 
        LEFT JOIN vitrisans ON stt.id = vitrisans.id_san AND vitrisans.tinh_trang = true
        LEFT JOIN monchois ON vitrisans.id_mon_choi = monchois.id
        WHERE stt.id = :id_san
      `;
      return await sequelize.query(query, { replacements: { id_san }, type: sequelize.QueryTypes.SELECT });
    }

    static async getDataById(id_san) {
      const query = `
        SELECT vitrisans.so_san, vitrisans.id, vitrisans.gia_san, vitrisans.mo_ta, monchois.ten_mon, monchois.id as id_mon_choi, datsans.ngay_dat + INTERVAL '1 day' as ngay_dat, datsans.gio_dat
        FROM vitrisans 
        JOIN monchois ON vitrisans.id_mon_choi = monchois.id 
        JOIN datsans ON vitrisans.id = datsans.id_vi_tri_dat_san
        WHERE vitrisans.id_san = :id_san AND vitrisans.tinh_trang = true AND monchois.tinh_trang = true
      `;
      return await sequelize.query(query, { replacements: { id_san }, type: sequelize.QueryTypes.SELECT });
    }
  }

  Santhethao.init({
    id_chu_san: DataTypes.INTEGER,
    ten_san: DataTypes.STRING,
    loai_san: DataTypes.STRING,
    icon: DataTypes.STRING,
    huyen: DataTypes.STRING,
    thanh_pho: DataTypes.STRING,
    dia_chi_cu_the: DataTypes.STRING,
    mo_ta: DataTypes.STRING,
    hinh_anh: DataTypes.STRING,
    gio_mo_cua: DataTypes.TIME,
    gio_dong_cua: DataTypes.TIME,
    kinh_do: DataTypes.STRING,
    vi_do: DataTypes.STRING,
    tinh_trang: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Santhethao',
    tableName: 'santhethaos',
    indexes: [
      { fields: ['id_chu_san'], name: 'idx_santhethaos_chusan' },
      { fields: ['thanh_pho', 'huyen'], name: 'idx_santhethaos_diachi' }
    ]
  });
  return Santhethao;
};