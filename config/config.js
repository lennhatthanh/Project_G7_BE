require("dotenv").config();
const fs = require("fs");

const sslConfig = {
    require: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync("./global-bundle.pem").toString(),
};

module.exports = () => {
    return {
        development: {
            host: process.env.DB_HOST,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            dialect: process.env.DB_DIALECT || "postgres",
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
            dialect: process.env.DB_DIALECT || "postgres",
            dialectOptions: {
                ssl: sslConfig,
            },
        },
    };
};