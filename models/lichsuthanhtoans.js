const pool = require("../db");

class lichsuthanhtoans {
  async add(id_dat_san, phuong_thuc, thanh_tien, noi_dung) {
    const data = await pool.query(
      "INSERT INTO lichsuthanhtoans(id_dat_san, phuong_thuc, thanh_tien, noi_dung) VALUES ($1,$2,$3,$4,$5) returning *",
      [id_dat_san, phuong_thuc, thanh_tien]
    );
    return data.rows[0];
  }

  async delete(id) {
    const data = await pool.query(
      "delete from lichsuthanhtoans where id=$1 returning *",
      [id]
    );
    return data.rows[0];
  }

  async getAll() {
    const data = await pool.query(
      `SELECT lichsudatsans.*, datsans.*, nguoidungs.id, nguoidungs.ho_ten, vitrisans.*, monchois.id, monchois.ten_mon,
                santhethaos.id, santhethaos.ten_san
        FROM lichsudatsans
        JOIN datsans ON datsans.id = lichsudatsans.id_dat_san
        JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
        JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_san
        JOIN monchois ON monchois.id = vitrisans.id_mon_choi
        JOIN santhethaos ON santhethaos.id = vitrisans.id_san`
    );
    return data.rows;
  }

  async getAllOpen(id_nguoi_dung) {
    const data = await pool.query(
      `SELECT lichsudatsans.*, datsans.*, nguoidungs.id, nguoidungs.ho_ten, vitrisans.*, monchois.id, monchois.ten_mon,
                santhethaos.id, santhethaos.ten_san
        FROM lichsudatsans
        JOIN datsans ON datsans.id = lichsudatsans.id_dat_san
        JOIN nguoidungs ON datsans.id_nguoi_dung = nguoidungs.id
        JOIN vitrisans ON vitrisans.id = datsans.id_vi_tri_san
        JOIN monchois ON monchois.id = vitrisans.id_mon_choi
        JOIN santhethaos ON santhethaos.id = vitrisans.id_san
        WHERE nguoidungs.id = $1 and lichsuthanhtoans.tinh_trang = true`,
      [id_nguoi_dung]
    );
    return data.rows;
  }
}

module.exports = new lichsuthanhtoans();
