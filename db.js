const { Pool } = require("pg");
const getDBConfig = require("./services/secret");
require("dotenv").config();

let pool;

const parseBoolean = (value) => {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
    return null;
};

const resolveDbSSL = () => {
    const dbSSL = parseBoolean(process.env.DB_SSL);
    if (dbSSL !== null) return dbSSL;
    return process.env.NODE_ENV === "production";
};

const init = async () => {
    if (!pool) {
        const config = await getDBConfig();
        const useSSL = resolveDbSSL();

        pool = new Pool({
            host: config.host,
            user: config.username,
            password: config.password,
            database: config.dbname,
            port: config.port,
            ssl: useSSL
                ? {
                      rejectUnauthorized: false,
                  }
                : false,
        });
    }
    return pool;
};

module.exports = {
    query: async (...args) => {
        const p = await init();
        return p.query(...args);
    },
};