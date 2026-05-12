const { Pool } = require("pg");
require("dotenv").config();

let pool;

const init = () => {
    if (pool) return pool;

    pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    return pool;
};

module.exports = {
    query: async (...args) => {
        const p = init();
        return p.query(...args);
    },
};