const pool = require("../db");

class datsandichvus {
  async add(id_dich_vu, id_dat_san) {
    const data = await pool.query(
      "INSERT INTO datsandichvus(id_dich_vu, id_dat_san) VALUES ($1, $2) RETURNING *",
      [id_dich_vu, id_dat_san]
    );
    return data.rows[0];
  }

  async update(id, id_dich_vu, id_dat_san) {
    const data = await pool.query(
      'UPDATE datsandichvus SET id_dich_vu = $1, id_dat_san = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      [id_dich_vu, id_dat_san, id]
    );
    return data.rows[0];
  }

  async delete(id) {
    const data = await pool.query(
      "DELETE FROM datsandichvus WHERE id = $1 RETURNING *",
      [id]
    );
    return data.rows[0];
  }
}

module.exports = new datsandichvus();
