const fs = require("fs");
const getSecret = require("../services/secret");

const sslConfig = {
    require: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync("./global-bundle.pem").toString(),
};

module.exports = async () => {
    const secret = await getSecret();

    return {
        development: {
            host: secret.host,
            username: secret.username,
            password: secret.password,
            database: secret.dbname,
            port: secret.port,
            dialect: "postgres",
            dialectOptions: {
                ssl: sslConfig,
            },
        },
        production: {
            host: secret.host,
            username: secret.username,
            password: secret.password,
            database: secret.dbname,
            port: secret.port,
            dialect: "postgres",
            dialectOptions: {
                ssl: sslConfig,
            },
        },
    };
};
