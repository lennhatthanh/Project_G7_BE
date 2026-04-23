const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "QLSAN",
  "postgres",
  "12345678",
  {
    host: "nthanh-database.ctsqaq0akyqe.ap-southeast-1.rds.amazonaws.com",
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

sequelize.authenticate()
  .then(() => console.log("✅ DB OK"))
  .catch(err => console.error("❌ DB FAIL:", err));
