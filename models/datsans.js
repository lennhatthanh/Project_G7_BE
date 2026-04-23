const pool = require("../db");

class datsans {
  async add(
    id_vi_tri_dat_san,
    id_nguoi_dung,
    ngay_dat,
    gio_dat,
    thanh_tien,
    orderCode
  ) {
    const data = await pool.query(
      `
    INSERT INTO datsans(id_vi_tri_dat_san, id_nguoi_dung, ngay_dat, gio_dat, thanh_tien, "orderCode") VALUES($1, $2, $3, $4, $5, $6) RETURNING *
    `,
      [
        id_vi_tri_dat_san,
        id_nguoi_dung,
        ngay_dat,
        gio_dat,
        thanh_tien,
        orderCode,
      ]
    );
    return data.rows[0];
  }

  async getLichSu(id_nguoi_dung) {
    const data = await pool.query(
      `
      SELECT danhgias.id AS id_danh_gia, datsans.id_vi_tri_dat_san, datsans."orderCode", datsans.ngay_dat, datsans.gio_dat, 
              datsans.thanh_tien, datsans."orderCode", santhethaos.ten_san, santhethaos.huyen, vitrisans.so_san
      FROM datsans 
      JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id
      JOIN santhethaos ON santhethaos.id = vitrisans.id_san 
      LEFT JOIN danhgias ON vitrisans.id = danhgias.id_vi_tri_san
      WHERE datsans.id_nguoi_dung = $1
      GROUP BY danhgias.id, datsans.id_vi_tri_dat_san, datsans.ngay_dat, datsans.gio_dat, 
              datsans.thanh_tien, datsans."orderCode", santhethaos.ten_san, santhethaos.huyen, vitrisans.so_san
    `,
      [id_nguoi_dung]
    );
    return data.rows;
  }
  async getLichSuNhanVien(id_nhan_vien) {
    const data = await pool.query(
      `
      SELECT datsans.*, nguoidungs.ho_ten, nguoidungs.so_dien_thoai
      FROM datsans 
      JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id 
      JOIN santhethaos ON vitrisans.id_san = santhethaos.id 
      JOIN nhanviens ON santhethaos.id = nhanviens.id_san 
      JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
      WHERE nhanviens.id = $1 
    `,
      [id_nhan_vien]
    );
    return data.rows;
  }
  async getLichSuChuSan(id_nhan_vien) {
    const data = await pool.query(
      `
      SELECT santhethaos.id AS id_san, datsans.*, nguoidungs.ho_ten, nguoidungs.so_dien_thoai
      FROM datsans 
      JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id 
      JOIN santhethaos ON vitrisans.id_san = santhethaos.id 
      JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
      WHERE santhethaos.id_chu_san = $1 
    `,
      [id_nhan_vien]
    );
    return data.rows;
  }

  async delete(orderCode) {
    const data = await pool.query(
      `
    DELETE FROM datsans WHERE "orderCode" = $1 AND tinh_trang = FALSE RETURNING *
    `,
      [orderCode]
    );
    return data.rows[0];
  }
  async deleteNguoiDung(id_nguoi_dung) {
    await pool.query(
      `
    DELETE FROM nguoidungs WHERE id = $1 AND mat_khau IS NULL`,
      [id_nguoi_dung]
    );
  }

  async update(orderCode) {
    const data = await pool.query(
      `
    UPDATE datsans SET tinh_trang = TRUE WHERE "orderCode" = $1 RETURNING *
    `,
      [orderCode]
    );
    return data.rows[0];
  }

  async layGiaSan(id_vi_tri_san) {
    const data = await pool.query(
      `SELECT gia_san FROM vitrisans WHERE id = $1`,
      [id_vi_tri_san]
    );
    return data.rows[0];
  }

  async layGioDat(ngay_dat){
    const data = await pool.query(`
      SELECT datsans.id_vi_tri_dat_san, datsans.ngay_dat, datsans.gio_dat
      FROM datsans
      JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_dat_san
      WHERE datsans.ngay_dat = $1
    `,[ngay_dat])
    return data.rows
  }

}

module.exports = new datsans();
