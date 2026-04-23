const pool = require("../db");

class ViTriSan {
    async datsan(id) {
        const data = await pool.query(
            `SELECT santhethaos.ten_san, COUNT(datsans.id) AS luot_dat
FROM datsans
JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id
JOIN santhethaos ON vitrisans.id_san = santhethaos.id WHERE santhethaos.id_chu_san = $1
GROUP BY santhethaos.ten_san`,
            [id]
        );
        return data.rows;
    }
    async sukien(id) {
        const data = await pool.query(
            `SELECT s.id, s.ten_su_kien, COUNT(n.id_nguoi_dung) AS so_nguoi
  FROM sukiens s
  JOIN santhethaos st ON s.id_san = st.id
  LEFT JOIN nguoidungsukiens n ON s.id = n.id_su_kien
  WHERE st.id_chu_san = $1
  GROUP BY s.id, s.ten_su_kien;
`,
            [id]
        );
        return data.rows;
    }
    async doanhthu(id) {
        const data = await pool.query(
            `SELECT santhethaos.ten_san, SUM(datsans.thanh_tien) AS tong_tien
FROM datsans
JOIN vitrisans ON datsans.id_vi_tri_dat_san = vitrisans.id
JOIN santhethaos ON vitrisans.id_san = santhethaos.id WHERE santhethaos.id_chu_san = $1
GROUP BY santhethaos.ten_san;`,
            [id]
        );
        return data.rows;
    }
}

module.exports = new ViTriSan();
