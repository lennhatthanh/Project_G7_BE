const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ region: "us-west-2" });

let cachedSecret = null;

const getSecret = async (secretId = "qlsan/thanh/db") => {
    if (cachedSecret) return cachedSecret;

    const command = new GetSecretValueCommand({
        SecretId: secretId,
    });

    const data = await client.send(command);
    cachedSecret = JSON.parse(data.SecretString);

    return cachedSecret;
};

module.exports = getSecret;
