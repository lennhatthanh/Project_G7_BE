const pool = require("../db");

class admins {
  async getByEmail(email) {
    const data = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    return data;
  }
}

module.exports = new admins();
