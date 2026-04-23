const pool = require("../db");

class sukiens {
    async add(
        id_san,
        ten_su_kien,
        noi_dung,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        so_luong,
        phi_tham_gia
    ) {
        const data = await pool.query(
            "INSERT INTO sukiens(id_san, ten_su_kien, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong, phi_tham_gia) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [
                id_san,
                ten_su_kien,
                noi_dung,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                so_luong,
                phi_tham_gia,
            ]
        );
        return data.rows[0];
    }
    async update(
        id,
        id_san,
        ten_su_kien,
        noi_dung,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        so_luong,
        tinh_trang
    ) {
        const data = await pool.query(
            'UPDATE sukiens SET id_san = $1, ten_su_kien = $2, noi_dung = $3, thoi_gian_bat_dau = $4, thoi_gian_ket_thuc = $5 ,tinh_trang = $6, so_luong = $7, "updatedAt" = NOW() WHERE id = $8 RETURNING *',
            [
                id_san,
                ten_su_kien,
                noi_dung,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                tinh_trang,
                so_luong,
                id,
            ]
        );
        return data.rows[0];
    }

    async delete(id) {
        const data = await pool.query(
            "DELETE FROM sukiens WHERE id = $1 returning *",
            [id]
        );
        return data.rows[0];
    }

    async getAll(id) {
        const data = await pool.query(
            `SELECT sukiens.*
            FROM sukiens
             JOIN santhethaos ON sukiens.id_san = santhethaos.id WHERE santhethaos.id_chu_san = $1`,
            [id]
        );
        return data.rows;
    }

    async getAllOpen() {
        const data = await pool.query(
            `SELECT sukiens.*, santhethaos.ten_san, sukiens.so_luong - COALESCE(thamgia.so_luong_tham_gia, 0) AS so_luong_tham_gia
            FROM sukiens
            JOIN santhethaos ON sukiens.id_san = santhethaos.id
            LEFT JOIN (
                SELECT id_su_kien, COUNT(*) AS so_luong_tham_gia
                FROM nguoidungsukiens
                GROUP BY id_su_kien
            ) AS thamgia ON thamgia.id_su_kien = sukiens.id
            WHERE COALESCE(thamgia.so_luong_tham_gia, 0) < sukiens.so_luong;
            `
        );
        return data.rows;
    }
    async checkThamGia(id) {
        const data = await pool.query(
            `SELECT id_su_kien FROM nguoidungsukiens WHERE id_nguoi_dung = $1`,
            [id]
        );
        return data.rows;
    }
}

module.exports = new sukiens();
