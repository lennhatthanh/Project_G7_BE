const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({
    region: "us-west-2",
});
let cachedConfig = null;
async function getDBConfig() {
    if (cachedConfig) return cachedConfig;
    const command = new GetSecretValueCommand({
        SecretId: "qlsan/dev/db",
    });

    const response = await client.send(command);

    if (!response.SecretString) {
        throw new Error("Secret empty");
    }

    return JSON.parse(response.SecretString);
}

module.exports = getDBConfig;
