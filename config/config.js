require("dotenv").config();
const fs = require("fs");

const sslConfig = {
    require: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync("./global-bundle.pem").toString(),
};

const config = {
    development: {
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        dialect: "postgres",
        dialectOptions: {
            ssl: sslConfig,
        },
    },
    production: {
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        dialect: "postgres",
        dialectOptions: {
            ssl: sslConfig,
        },
    },
};

module.exports = config;