const pool = require("../db");

class danhgias {
  async add(id_vi_tri_san, id_nguoi_dung, so_sao, danh_gia) {
    const data = await pool.query(
      "INSERT INTO danhgias(id_vi_tri_san, id_nguoi_dung, so_sao, danh_gia) VALUES ($1, $2, $3, $4) RETURNING *",
      [id_vi_tri_san, id_nguoi_dung, so_sao, danh_gia]
    );
    return data.rows[0];
  }

  async update(id, so_sao, danh_gia, tinh_trang) {
    const data = await pool.query(
      'UPDATE danhgias so_sao = $1, danh_gia = $2, tinh_trang = $3, "updatedAt" = NOW() WHERE id = $4 RETURNING *',
      [so_sao, danh_gia, tinh_trang, id]
    );
    return data.rows[0];
  }

  async delete(id) {
    const data = await pool.query(
      "DELETE FROM danhgias WHERE id = $1 RETURNING *",
      [id]
    );
    return data.rows[0];
  }

  async getAll() {
    const data = await pool.query(
      `SELECT danhgias.*, nguoidungs.ho_ten, santhethaos.id AS id_san
            FROM danhgias 
            JOIN vitrisans ON danhgias.id_vi_tri_san = vitrisans.id
            JOIN nguoidungs ON danhgias.id_nguoi_dung = nguoidungs.id
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id`
    );
    return data.rows;
  }

  async getAllOpen() {
    const data = await pool.query(
      `SELECT danhgias.*, nguoidungs.ho_ten, nguoidungs.tinh_trang, vitrisans.ho_ten, vitrisans.tinh_trang
            FROM danhgias 
            JOIN vitrisans ON danhgias.id_vi_tri_san = vitrisans.id
            JOIN nguoidungs ON danhgias.id_nguoi_dung = nguoidungs.id
            WHERE danhgias.tinh_trang = true
            AND nguoidungs.tinh_trang = true
            AND vitrisans.tinh_trang = true
        `
    );
    return data.rows;
  }
}

module.exports = new danhgias();
