const pool = require("../db");
class DichVu {
  async add(id_san, ten_dich_vu, mo_ta, don_gia) {
    const data = await pool.query(
      "INSERT INTO dichvus(id_san, ten_dich_vu, mo_ta, don_gia) VALUES ($1,$2,$3,$4) returning *",
      [id_san,ten_dich_vu, mo_ta, don_gia]
    );
    return data.rows[0];
  }
  async update(id, id_san,ten_dich_vu, mo_ta, don_gia,tinh_trang) {
    const data = await pool.query(
      'update dichvus set id_san = $1,ten_dich_vu =$2, mo_ta=$3, don_gia=$4, tinh_trang = $5,"updatedAt" = NOW() where id =$6 RETURNING * ',
      [id_san,ten_dich_vu, mo_ta, don_gia,tinh_trang, id]
    );
    return data.rows[0];
  }
  async delete(id) {
    const data = await pool.query(
      "delete from dichvus where id=$1 RETURNING *",
      [id]
    );
    return data.rows[0];
  }
  async getAll(id) {
    const data = await pool.query(
      `select dichvus.*, santhethaos.id_chu_san
      from dichvus 
      join santhethaos on dichvus.id_san = santhethaos.id where santhethaos.id_chu_san = $1 and santhethaos.tinh_trang = true `, [id]
    );
    return data.rows;
  }
  async getAllOpenById(id) {
    const data = await pool.query(
      `select dichvus.*
      from dichvus 
      join santhethaos on dichvus.id_san = santhethaos.id where dichvus.id_san = $1 AND dichvus.tinh_trang = true`, [id]
    );
    return data.rows;
  }
  async getAllOpen() {
    const data = await pool.query(
      `select dichvus.*
      from dichvus 
      join santhethaos on dichvus.id_san = santhethaos.id 
      where dichvus.tinh_trang = true and santhethaos.tinh_trang = true`
    );
    return data.rows;
  }
}
module.exports = new DichVu();
