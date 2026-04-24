require("dotenv").config();
const {
    SecretsManagerClient,
    GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const DEFAULT_AWS_REGION = "ap-southeast-1";
const DEFAULT_DB_SECRET_ID = "qlsan/dev/db";

function getEnvValue(name) {
    const value = process.env[name];
    return typeof value === "string" ? value.trim() : "";
}

function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function hasLocalDbConfig() {
    return Boolean(getEnvValue("DB_USER") && getEnvValue("DB_NAME"));
}

function loadLocalDbConfig() {
    return {
        host: getEnvValue("DB_HOST") || "localhost",
        username: getEnvValue("DB_USER"),
        password: getEnvValue("DB_PASSWORD"),
        dbname: getEnvValue("DB_NAME"),
        port: toNumber(getEnvValue("DB_PORT"), 5432),
    };
}

async function loadAwsDbConfig() {
    const region = getEnvValue("AWS_REGION") || DEFAULT_AWS_REGION;
    const secretId = getEnvValue("AWS_DB_SECRET_ID") || DEFAULT_DB_SECRET_ID;
    const client = new SecretsManagerClient({ region });
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await client.send(command);

    if (!response.SecretString) {
        throw new Error("Secret empty");
    }

    const secret = JSON.parse(response.SecretString);

    return {
        host: secret.host,
        username: secret.username,
        password: secret.password,
        dbname: secret.dbname,
        port: toNumber(secret.port, 5432),
    };
}

async function getDBConfig() {
    const source = getEnvValue("DB_CONFIG_SOURCE").toLowerCase();

    if (source === "env") {
        return loadLocalDbConfig();
    }

    if (source === "aws") {
        return loadAwsDbConfig();
    }

    if (hasLocalDbConfig()) {
        return loadLocalDbConfig();
    }

    return loadAwsDbConfig();
}

module.exports = getDBConfig;
