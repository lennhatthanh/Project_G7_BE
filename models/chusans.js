const pool = require("../db");

class chusans {
  async add(ho_ten, email, hashed, so_dien_thoai, gioi_tinh) {
    const data = await pool.query(
      "INSERT INTO chusans(ho_ten ,email,mat_khau ,so_dien_thoai ,gioi_tinh) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [ho_ten, email, hashed, so_dien_thoai, gioi_tinh]
    );
    return data.rows[0];
  }

  async update(
    id,
    ho_ten,
    email,
    hashed,
    so_dien_thoai,
    gioi_tinh,
    tinh_trang
  ) {
    const data = await pool.query(
      'UPDATE chusans SET ho_ten = $1, mat_khau = $2, email = $3, so_dien_thoai = $4, gioi_tinh = $5, tinh_trang = $6, "updatedAt" = NOW() WHERE id = $7 RETURNING *',
      [ho_ten, hashed, email, so_dien_thoai, gioi_tinh, tinh_trang, id]
    );
    return data.rows[0];
  }

  async updateOpen(
    id,
    ho_ten,
    so_dien_thoai,
    gioi_tinh,
    tinh_trang
  ) {
    const data = await pool.query(
     'UPDATE chusans SET ho_ten = $1, so_dien_thoai = $2, gioi_tinh = $3, tinh_trang = $4, "updatedAt" = NOW() WHERE id = $5 RETURNING *',
      [ho_ten, so_dien_thoai, gioi_tinh, tinh_trang, id]
    );
    return data.rows[0];
  }

  async changeMatKhau(id, hashed) {
    await pool.query('UPDATE chusans SET mat_khau = $1, "updatedAt" = NOW() WHERE id = $2',[hashed, id])
  }

  async getById(id) {
    const data = await pool.query("SELECT * FROM chusans where id = $1", [
      id,
    ]);
    return data.rows[0];
  }
  async getByEmail(email) {
    const data = await pool.query("SELECT * FROM chusans where email = $1", [
      email,
    ]);
    return data;
  }
  async getAll() {
    const data = await pool.query(
      `SELECT chusans.*
      FROM chusans`
    );
    return data.rows;
  }

  async delete(id) {
    const data = await pool.query(
      "DELETE FROM chusans WHERE id = $1 RETURNING *",
      [id]
    );
    return data.rows[0];
  }
}

module.exports = new chusans();
