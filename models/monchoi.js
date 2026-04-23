const pool = require("../db");

class MonChoi {
  async add(ten_mon, mo_ta) {
    const data = await pool.query(
      "INSERT INTO monchois(ten_mon, mo_ta) VALUES ($1, $2) RETURNING *",
      [ten_mon, mo_ta]
    );
    return data.rows[0];
  }

  async update(id, ten_mon, mo_ta, tinh_trang) {
    const data = await pool.query(
      'UPDATE monchois SET ten_mon = $1, mo_ta = $2, tinh_trang = $3, "updatedAt" = NOW() WHERE id = $4 RETURNING *',
      [ten_mon, mo_ta, tinh_trang, id]
    );
    return data.rows[0];
  }

  async delete(id) {
    const data = await pool.query(
      "DELETE FROM monchois WHERE id = $1 RETURNING *",
      [id]
    );
    return data.rows[0];
  }

  async getAll() {
    const data = await pool.query("SELECT * FROM monchois");
    return data.rows;
  }

  async getAllOpen() {
    const data = await pool.query(
      "SELECT * FROM monchois WHERE tinh_trang = true"
    );
    return data.rows;
  }
}

module.exports = new MonChoi();
