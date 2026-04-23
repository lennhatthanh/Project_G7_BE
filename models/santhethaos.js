const pool = require("../db");

class SanTheThao {
    async add(
        id_chu_san,
        ten_san,
        loai_san,
        icon,
        huyen,
        thanh_pho,
        dia_chi_cu_the,
        mota,
        hinh_anh,
        gio_mo_cua,
        gio_dong_cua,
        kinh_do,
        vi_do
    ) {
        const data = await pool.query(
            `INSERT INTO santhethaos (
        id_chu_san, ten_san, loai_san,icon, huyen, thanh_pho, dia_chi_cu_the,
        mo_ta, hinh_anh, gio_mo_cua, gio_dong_cua, kinh_do, vi_do
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13)
      RETURNING *`,
            [
                id_chu_san,
                ten_san,
                loai_san,
                icon,
                huyen,
                thanh_pho,
                dia_chi_cu_the,
                mota,
                hinh_anh,
                gio_mo_cua,
                gio_dong_cua,
                kinh_do,
                vi_do,
            ]
        );
        return data.rows[0];
    }

    async update(
        id,
        id_chu_san,
        ten_san,
        loai_san,
        icon,
        huyen,
        thanh_pho,
        dia_chi_cu_the,
        mo_ta,
        hinh_anh,
        gio_mo_cua,
        gio_dong_cua,
        kinh_do,
        vi_do,
        tinh_trang
    ) {
        if (hinh_anh === undefined) {
            const data = await pool.query(
                `UPDATE santhethaos
                SET ten_san = $1, loai_san = $2, huyen = $3, thanh_pho = $4,
                dia_chi_cu_the = $5, mo_ta = $6, gio_mo_cua = $7, gio_dong_cua = $8,
                kinh_do = $9, vi_do = $10, tinh_trang = $12
                WHERE id = $11 RETURNING *`,
                [
                    ten_san,
                    loai_san,
                    huyen,
                    thanh_pho,
                    dia_chi_cu_the,
                    mo_ta,
                    gio_mo_cua,
                    gio_dong_cua,
                    kinh_do,
                    vi_do,
                    id,
                    tinh_trang,
                ]
            );
            return data.rows[0];
        } else {
            const data = await pool.query(
                `UPDATE santhethaos
                SET ten_san = $1, loai_san = $2, huyen = $3, thanh_pho = $4,
                dia_chi_cu_the = $5, mo_ta = $6, hinh_anh = $7, gio_mo_cua = $8, gio_dong_cua = $9,
                kinh_do = $10, vi_do = $11, tinh_trang = $13
                WHERE id = $12 RETURNING *`,
                [
                    ten_san,
                    loai_san,
                    huyen,
                    thanh_pho,
                    dia_chi_cu_the,
                    mo_ta,
                    hinh_anh,
                    gio_mo_cua,
                    gio_dong_cua,
                    kinh_do,
                    vi_do,
                    id,
                    tinh_trang,
                ]
            );
            return data.rows[0];
        }
    }

    async delete(id) {
        const data = await pool.query(
            `DELETE FROM santhethaos WHERE id = $1 RETURNING *`,
            [id]
        );
        return data.rows[0];
    }

    async getAllOpen() {
        const data = await pool.query(
            `SELECT santhethaos.* FROM santhethaos  where tinh_trang = true`
        );
        return data.rows;
    }
    async getAllByChuSan(id_chu_san) {
        const data = await pool.query(
            `SELECT santhethaos.* 
            FROM santhethaos 
            WHERE santhethaos.id_chu_san = $1`,
            [id_chu_san]
        );
        return data.rows;
    }
    async getAllByChuSanOpen(id_chu_san) {
        const data = await pool.query(
            `SELECT santhethaos.* 
            FROM santhethaos 
            WHERE santhethaos.id_chu_san = $1
            AND tinh_trang = true`,
            [id_chu_san]
        );
        return data.rows;
    }

    async getById(id_san) {
        const data = await pool.query(
            `SELECT stt.kinh_do, stt.vi_do, stt.huyen, stt.ten_san, stt.thanh_pho, stt.dia_chi_cu_the, stt.gio_mo_cua, stt.gio_dong_cua,  
                vitrisans.*, monchois.ten_mon
            FROM santhethaos stt 
            LEFT JOIN vitrisans ON stt.id = vitrisans.id_san AND vitrisans.tinh_trang = true
            LEFT JOIN monchois ON vitrisans.id_mon_choi = monchois.id
            WHERE stt.id = $1`,
            [id_san]
        );
        return data.rows;
    }
    async getDataById(id_san) {
        const data = await pool.query(
            `SELECT vitrisans.so_san, vitrisans.id, vitrisans.gia_san, vitrisans.mo_ta, monchois.ten_mon, monchois.id as id_mon_choi, datsans.ngay_dat + INTERVAL '1 day' as ngay_dat, datsans.gio_dat
            FROM vitrisans JOIN monchois ON vitrisans.id_mon_choi = monchois.id JOIN datsans ON vitrisans.id = datsans.id_vi_tri_dat_san
            WHERE vitrisans.id_san = $1 AND vitrisans.tinh_trang = true AND monchois.tinh_trang = true`,
            [id_san]
        );
        return data.rows;
    }
    
}

module.exports = new SanTheThao();
