const { Pool } = require("pg");
const getDBConfig = require("./services/secret");

let pool;

const init = async () => {
    if (pool) return pool;

    const config = await getDBConfig();

    pool = new Pool({
        host: config.host,
        user: config.username,
        password: config.password,
        database: config.dbname,
        port: config.port,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    return pool;
};
module.exports = {
    query: async (...args) => {
        const p = await init();
        return p.query(...args);
    },
};
