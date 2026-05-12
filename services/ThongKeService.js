const { sequelize } = require('../models'); // Lấy instance kết nối DB từ thư mục models

class ThongKeService {
    async datsan(id_chu_san) {
        const query = `
            SELECT santhethaos.ten_san, COUNT(datsans.id) AS luot_dat
            FROM datsans
            JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id 
            WHERE santhethaos.id_chu_san = :id_chu_san
            GROUP BY santhethaos.ten_san
        `;
        return await sequelize.query(query, {
            replacements: { id_chu_san },
            type: sequelize.QueryTypes.SELECT
        });
    }

    async sukien(id_chu_san) {
        const query = `
            SELECT s.id, s.ten_su_kien, COUNT(n.id_nguoi_dung) AS so_nguoi
            FROM sukiens s
            JOIN santhethaos st ON s.id_san = st.id
            LEFT JOIN nguoidungsukiens n ON s.id = n.id_su_kien
            WHERE st.id_chu_san = :id_chu_san
            GROUP BY s.id, s.ten_su_kien;
        `;
        return await sequelize.query(query, {
            replacements: { id_chu_san },
            type: sequelize.QueryTypes.SELECT
        });
    }

    async doanhthu(id_chu_san) {
        const query = `
            SELECT santhethaos.ten_san, SUM(datsans.thanh_tien) AS tong_tien
            FROM datsans
            JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id
            JOIN santhethaos ON vitrisans.id_san = santhethaos.id 
            WHERE santhethaos.id_chu_san = :id_chu_san
            GROUP BY santhethaos.ten_san;
        `;
        return await sequelize.query(query, {
            replacements: { id_chu_san },
            type: sequelize.QueryTypes.SELECT
        });
    }
}

module.exports = new ThongKeService();  