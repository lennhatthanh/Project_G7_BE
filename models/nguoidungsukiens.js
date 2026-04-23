const pool = require("../db");

class nguoidungsukiens {
  async add(id_nguoi_dung, id_su_kien, can_cuoc_cong_dan, orderCode) {
    const data = await pool.query(
        `INSERT INTO nguoidungsukiens(id_nguoi_dung,id_su_kien,can_cuoc_cong_dan,"orderCode") VALUES ($1, $2, $3, $4) RETURNING *`,
        [id_nguoi_dung, id_su_kien, can_cuoc_cong_dan,orderCode]
      );
      return data.rows[0];
  }

  async update(orderCode) {
    const data = await pool.query(
      'UPDATE nguoidungsukiens SET phe_duyet = TRUE, "updatedAt" = NOW() WHERE "orderCode" = $1 RETURNING *',
      [orderCode]
    );
    return data.rows[0];
  }

  async delete(orderCode) {
    const data = await pool.query(
      `DELETE FROM nguoidungsukiens WHERE "orderCode" = $1 AND phe_duyet = FALSE RETURNING *`,
      [orderCode]
    );
    return data.rows[0];
  }

  async getAll() {
    const data = await pool.query(
      `SELECT nguoidungsukiens.*, nguoidungs.id, nguoidungs.ho_ten, nguoidungs.tinh_trang, sukiens.id, 
                sukiens.ten_su_kien, sukiens.id_san, santhethaos.id, santhethaos.ten_san
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungdungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san`
    );
  }

  async getAllOpen() {
    const data = await pool.query(
      `SELECT nguoidungsukiens.*, nguoidungs.id, nguoidungs.ho_ten, nguoidungs.tinh_trang, sukiens.id, 
                sukiens.ten_su_kien, sukiens.id_san, sukiens.tinh_trang, santhethaos.id, santhethaos.ten_san
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungdungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san
        WHERE sukiens.tinh_trang = true`
    );
  }

  async getAllByNhanVien(id_nhan_vien) {
    const data = await pool.query(
      `SELECT nguoidungsukiens.*, nguoidungs.id, nguoidungs.ho_ten, nguoidungs.tinh_trang, sukiens.id, 
                sukiens.ten_su_kien, sukiens.id_san, santhethaos.id, santhethaos.ten_san, nhanviens.id_san, nhanviens.id
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungdungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san
        JOIN nhanviens ON santhethaos.id = nhanviens.id_san
        WHERE nhanviens.id = $1`,
      [id_nhan_vien]
    );
  }

  async getAllByChuSan(id_chu_san) {
    const data = await pool.query(
      `SELECT nguoidungsukiens.*, nguoidungs.id, nguoidungs.ho_ten, nguoidungs.tinh_trang, sukiens.id, 
                sukiens.ten_su_kien, sukiens.id_san, santhethaos.id, santhethaos.ten_san, chusans.id
        FROM nguoidungsukiens
        JOIN nguoidungs ON nguoidungs.id = nguoidungsukiens.id_nguoi_dung
        JOIN sukiens ON sukiens.id = nguoidungdungsukiens.id_su_kien
        JOIN santhethaos ON santhethaos.id = sukiens.id_san
        JOIN nhanviens ON santhethaos.id_chu_san = chusans.id
        WHERE chusans.id = $1`,
      [id_chu_san]
    );
  }
  async checkSoLuong(id_su_kien) {
    const data = await pool.query(
      `SELECT COALESCE(COUNT(*), 0) AS so_luong FROM nguoidungsukiens WHERE id_su_kien = $1`,
      [id_su_kien]
    );
    return data.rows[0];
  }
}

module.exports = new nguoidungsukiens();
