const pool = require("../db");
class nhanviens {
    async add(id_san, ho_ten, email, hashed, so_dien_thoai, gioi_tinh) {
        const data = await pool.query(
            "INSERT INTO nhanviens(id_san, ho_ten ,email,mat_khau ,so_dien_thoai ,gioi_tinh) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [id_san, ho_ten, email, hashed, so_dien_thoai, gioi_tinh]
        );
        return data.rows[0];
    }

    async update(
        id,
        id_san,
        ho_ten,
        email,
        hashed,
        so_dien_thoai,
        gioi_tinh,
        tinh_trang
    ) {
        const data = await pool.query(
            'UPDATE nhanviens SET ho_ten = $1, mat_khau = $2, email = $3, so_dien_thoai = $4, gioi_tinh = $5, tinh_trang = $6, "updatedAt" = NOW(), id_san =$7 WHERE id = $8 RETURNING *',
            [
                ho_ten,
                hashed,
                email,
                so_dien_thoai,
                gioi_tinh,
                tinh_trang,
                id_san,
                id,
            ]
        );
        return data.rows[0];
    }

    async updateOpen(id, ho_ten, so_dien_thoai, gioi_tinh, tinh_trang) {
        const data = await pool.query(
            'UPDATE nhanviens SET ho_ten = $1, so_dien_thoai = $2, gioi_tinh = $3, tinh_trang = $4, "updatedAt" = NOW() WHERE id = $5 RETURNING *',
            [ho_ten, so_dien_thoai, gioi_tinh, tinh_trang, id]
        );
        return data.rows[0];
    }

    async delete(id) {
        const data = await pool.query(
            "DELETE FROM nhanviens WHERE id = $1 RETURNING *",
            [id]
        );
        return data.rows[0];
    }
    async changeMatKhau(id, hashed) {
        await pool.query(
            'UPDATE nhanviens SET mat_khau = $1, "updatedAt" = NOW() WHERE id = $2',
            [hashed, id]
        );
    }

    async getAll() {
        const nhanvien = await pool.query(
            `SELECT nhanviens.*, santhethaos.ten_san, chusans.ho_ten as ho_ten_chu_san
      FROM nhanviens 
      JOIN santhethaos ON nhanviens.id_san = santhethaos.id
      JOIN chusans ON chusans.id = santhethaos.id_chu_san`
        );
        return nhanvien.rows;
    }

    async getByEmail(email) {
        const data = await pool.query(
            "SELECT * FROM nhanviens where email = $1",
            [email]
        );
        return data;
    }

    async getById(id) {
        const data = await pool.query("SELECT * FROM nhanviens where id = $1", [
            id,
        ]);
        return data.rows[0];
    }

    async getByChuSan(id_chu_san) {
        const nhanvien = await pool.query(
            `SELECT nhanviens.*, santhethaos.ten_san
      FROM nhanviens 
      JOIN santhethaos ON nhanviens.id_san = santhethaos.id
      JOIN chusans ON chusans.id = santhethaos.id_chu_san
      WHERE chusans.id = $1 AND santhethaos.tinh_trang = true`,
            [id_chu_san]
        );
        return nhanvien.rows;
    }
}

module.exports = new nhanviens();
