const pool = require("../db");

class magiamgias {
    async add(
        id_san,
        ma_giam_gia,
        gia_tri_giam,
        mo_ta,
        loai_giam_gia,
        ngay_bat_dau,
        ngay_ket_thuc
    ) {
        const data = await pool.query(
            `INSERT INTO magiamgias(loai_giam_gia, ma_giam_gia, gia_tri_giam, mo_ta , ngay_bat_dau, ngay_ket_thuc, id_san)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                loai_giam_gia,
                ma_giam_gia,
                gia_tri_giam,
                mo_ta,
                ngay_bat_dau,
                ngay_ket_thuc,
                id_san,
            ]
        );
        return data.rows[0];
    }

    async update(
        ma_giam_gia,
        gia_tri_giam,
        mo_ta,
        loai_giam_gia,
        ngay_bat_dau,
        ngay_ket_thuc,
        tinh_trang,
        id
    ) {
        const data = await pool.query(
            `UPDATE magiamgias 
     SET ma_giam_gia = $1, gia_tri_giam = $2, mo_ta = $3, loai_giam_gia = $4, ngay_bat_dau = $5, ngay_ket_thuc = $6,tinh_trang=$7, "updatedAt" = NOW() 
     WHERE id = $8 RETURNING *`,
            [
                ma_giam_gia,
                gia_tri_giam,
                mo_ta,
                loai_giam_gia,
                ngay_bat_dau,
                ngay_ket_thuc,
                tinh_trang,
                id,
            ]
        );
        return data.rows[0];
    }

    async delete(id) {
        const data = await pool.query(
            "DELETE FROM magiamgias WHERE id = $1 RETURNING *",
            [id]
        );
        return data.rows[0];
    }

    async getAll(id) {
        const data = await pool.query(
            `SELECT magiamgias.*
        FROM magiamgias 
        JOIN santhethaos ON magiamgias.id_san = santhethaos.id where santhethaos.id_chu_san = $1 and santhethaos.tinh_trang = true`,
            [id]
        );
        return data.rows;
    }

    async getAllOpen() {
        const data = await pool.query(
            `SELECT magiamgias.*, santhethaos.id,santhethaos.ten_san, santhethaos.tinh_trang 
      FROM magiamgias 
      JOIN santhethaos ON magiamgias.id_san = santhethaos.id 
      WHERE magiamgias.tinh_trang = true and santhethaos.tinh_trang = true`
        );
        return data.rows;
    }

    async kiemTraMa(magiamgia, id_san) {
        const data = await pool.query(
            `SELECT magiamgias.gia_tri_giam
        FROM magiamgias
        WHERE ma_giam_gia = $1 AND id_san = $2
        AND tinh_trang = true
        AND NOW() BETWEEN ngay_bat_dau AND ngay_ket_thuc;`,
            [magiamgia, id_san]
        );
        return data.rows[0];
    }
}

module.exports = new magiamgias();
