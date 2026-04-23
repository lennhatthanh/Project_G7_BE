require("dotenv").config();
const fs = require("fs");
const getDBConfig = require("../services/secret");

const sslConfig = {
    require: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync("./global-bundle.pem").toString(),
};

module.exports = async () => {
    const config = await getDBConfig();
    console.log(config);
    
    return {
        development: {
            host: config.host,
            username: config.username,
            password: config.password,
            database: config.dbname,
            port: config.port,
            dialect: process.env.DB_DIALECT || "postgres",
            dialectOptions: {
                ssl: sslConfig,
            },
        },
        production: {
            host: config.host,
            username: config.username,
            password: config.password,
            database: config.dbname,
            port: config.port,
            dialect: process.env.DB_DIALECT || "postgres",
            dialectOptions: {
                ssl: sslConfig,
            },
        },
    };
};