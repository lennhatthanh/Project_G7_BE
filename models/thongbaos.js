const pool = require("../db");
class ThongBao {
    async add(id_san, tieu_de, noi_dung, tinh_trang = true) {
        const data = await pool.query(
            "insert into thongbaos(id_san, tieu_de, noi_dung, tinh_trang) values ($1,$2,$3,$4) returning *",
            [id_san, tieu_de, noi_dung, tinh_trang]
        );
        return data.rows[0];
    }
    async update(id, tieu_de, noi_dung, tinh_trang, id_san) {
        const data = await pool.query(
            'update thongbaos set tieu_de=$1,noi_dung=$2,tinh_trang=$3,id_san=$5, "updatedAt" = NOW() where id=$4 returning *',
            [tieu_de, noi_dung, tinh_trang, id, id_san]
        );
        return data.rows[0];
    }
    async delete(id) {
        const data = await pool.query(
            "DELETE FROM thongbaos WHERE id = $1 RETURNING *",
            [id]
        );
        return data.rows[0];
    }
    async getAll(id) {
        const data = await pool.query(
            `SELECT thongbaos.*, santhethaos.ten_san
             FROM thongbaos 
             JOIN santhethaos ON thongbaos.id_san = santhethaos.id where santhethaos.id_chu_san = $1 and santhethaos.tinh_trang = true`, [id]
        );
        return data.rows;
    }
    async getAllOpen() {
        const data = await pool.query(
            `SELECT thongbaos.*, santhethaos.ten_san, santhethaos.tinh_trang
             FROM thongbaos 
             JOIN santhethaos ON thongbaos.id_san = santhethaos.id
             WHERE thongbaos.tinh_trang = true 
             AND santhethaos.tinh_trang = true`
        );
        return data.rows;
    }
    async getAllOpenThongBao(id_san) {
        const data = await pool.query(
            `SELECT thongbaos.*, santhethaos.ten_san, santhethaos.tinh_trang
             FROM thongbaos 
             JOIN santhethaos ON thongbaos.id_san = santhethaos.id
             WHERE thongbaos.tinh_trang = true 
             AND santhethaos.tinh_trang = true
             AND thongbaos.id_san = $1`,[id_san]
        );
        return data.rows;
    }
    async layEmail(id_san){
        const data = await pool.query(`
            SELECT DISTINCT nguoidungs.id, nguoidungs.email
            FROM nguoidungs 
            JOIN datsans ON nguoidungs.id = datsans.id_nguoi_dung
            JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_dat_san
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id
            WHERE id_san = $1 AND nguoidungs.is_verified = true
        `,[id_san])
        return data.rows
    }
    
}
module.exports = new ThongBao();
