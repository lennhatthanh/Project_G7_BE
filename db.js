const { Pool } = require("pg");
const getSecret = require("./services/secret");

let pool;

const init = async () => {
    if (pool) return pool;

    const secret = await getSecret();

    pool = new Pool({
        host: secret.host,
        user: secret.username,
        password: secret.password,
        database: secret.dbname,
        port: secret.port,
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
