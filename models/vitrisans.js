const pool = require("../db");

class ViTriSan {
  async add(id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang = true) {
    const data = await pool.query(
      `INSERT INTO vitrisans (id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang]
    );
    return data.rows[0];
  }

  async update(id, id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang) {
    const data = await pool.query(
      `UPDATE vitrisans
       SET id_san = $1, id_mon_choi = $2, so_san = $3, gia_san = $4, mo_ta = $5, tinh_trang = $6, "updatedAt" = NOW()
       WHERE id = $7 RETURNING *`,
      [id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang, id]
    );
    return data.rows[0];
  }

  async delete(id) {
    const data = await pool.query(
      `DELETE FROM vitrisans WHERE id = $1 RETURNING *`,
      [id]
    );
    return data.rows[0];
  }

  async getAll() {
    const data = await pool.query(
      `SELECT vitrisans.*
            FROM vitrisans 
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id
            JOIN monchois ON vitrisans.id_mon_choi = monchois.id
            JOIN chusans ON santhethaos.id_chu_san = chusans.id`
    );
    return data.rows;
  }

  async getAllOpen() {
    const data = await pool.query(
      `SELECT vitrisans.*, santhethaos.id, santhethaos.ten_san, monchois.id, monchois.ten_mon
            FROM vitrisans 
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id
            JOIN monchois ON vitrisans.id_mon_choi = monchois.id
            JOIN chusans ON santhethaos.id_chu_san = chusans.id
            WHERE vitrisans.tinh_trang = true`
    );
    return data.rows;
  }

  async getAllOpenSanId(id_san) {
    const data = await pool.query(
      `SELECT vitrisans.id_san, santhethaos.id, vitrisans.id, vitrisans.so_san, monchois.ten_mon
            FROM vitrisans 
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id
            JOIN monchois ON vitrisans.id_mon_choi = monchois.id
            WHERE vitrisans.tinh_trang = true AND vitrisans.id_san = $1`,[id_san]
    );
    return data.rows;
  }

  async getByChuSanId(id_chu_san) {
    const data = await pool.query(
      `SELECT vitrisans.*
            FROM vitrisans 
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id
            WHERE santhethaos.id_chu_san = $1 and santhethaos.tinh_trang = true`,
      [id_chu_san]
    );
    return data.rows;
  }
  async getByNhanVienId(id_chu_san) {
    const data = await pool.query(
      `SELECT vitrisans.*
            FROM vitrisans 
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id
            JOIN nhanviens ON santhethaos.id = nhanviens.id_san
            WHERE nhanviens.id = $1 and santhethaos.tinh_trang = true`,
      [id_chu_san]
    );
    return data.rows;
  }
}

module.exports = new ViTriSan();
