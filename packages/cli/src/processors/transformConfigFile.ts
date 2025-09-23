import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import type {ProjectClient} from "../services/ProjectClient.js";

export function transformConfigFile(project: ProjectClient, data: RenderDataContext) {
  if (!data.config && data.commandName === "init") {
    project.addConfigSource("EnvsConfigSource", {
      moduleSpecifier: "@tsed/config/envs"
    });
  }

  if (data.config) {
    if (data.configDotenv) {
      project.addConfigSource("DotenvConfigSource", {
        moduleSpecifier: "@tsed/config/dotenv"
      });
    } else if (data.configEnvs) {
      project.addConfigSource("EnvsConfigSource", {
        moduleSpecifier: "@tsed/config/envs"
      });
    }

    if (data.configJson) {
      project.addConfigSource("JsonConfigSource", {
        moduleSpecifier: "@tsed/config/json",
        content: `withOptions(JsonConfigSource, {
      path: "./config.json"
    })`
      });
    }
    if (data.configYaml) {
      project.addConfigSource("YamlConfigSource", {
        moduleSpecifier: "@tsed/config/yaml",
        content: `withOptions(YamlConfigSource, {
      path: "./config.yaml"
    })`
      });
    }

    if (data.configAwsSecrets) {
      project.addConfigSource("AwsSecretsConfigSource", {
        moduleSpecifier: "@tsedio/config-source-aws-secrets",
        content: `withOptions(AwsSecretsConfigSource, {
              name: "aws",
      path: "/my-app/config", // Path prefix in Secrets Manager
      region: "us-east-1", // AWS region
      watch: true // Enable secrets watching
      // validationSchema: object({}) // Optional: add a validation schema
      // maxConcurrency: 10
      })`
      });
    }

    if (data.configVault) {
      project.addConfigSource("VaultConfigSource", {
        moduleSpecifier: "@tsedio/config-vault",
        content: `    withOptions(VaultConfigSource, {
      name: "vault",
      endpoint: "http://localhost:8200", // Vault server URL
      token: "your-vault-token", // Your Vault token
      secretPath: "secret/data/myapp", // Path to your secret (KV v2 or v1, see below)
      refreshInterval: 10000 // ⏱️ Polling interval in ms (default: 10s)
      // Additional node-vault options

      // validationSchema: object({}) // Optional: add a validation schema
    })`
      });
    }
    if (data.configIoredis) {
      project.addConfigSource("IoredisConfigSource", {
        moduleSpecifier: "@tsedio/config-ioredis",
        content: `withOptions(IoredisConfigSource, {
      name: "redis",
      prefixKey: "my-config", // Optional: All config keys will be prefixed
      url: "redis://localhost:6379" // Or use any Redis/Cluster options
      // validationSchema: object({}) // Optional: add a validation schema
    })`
      });
    }

    if (data.configMongo) {
      project.addConfigSource("MongoConfigSource", {
        moduleSpecifier: "@tsedio/config-mongo",
        content: `withOptions(MongoConfigSource, {
      name: "mongo",
      url: "mongodb://localhost:27017", // MongoDB connection URL
      database: "my_database", // Database name
      collection: "config" // Collection used for config storage

      // Additional MongoDB client options can be provided here

      // ConfigSource options
      // validationSchema: object({}) // Optional: add a validation schema
    })`
      });
    }

    if (data.configPostgres) {
      project.addConfigSource("PostgresConfigSource", {
        moduleSpecifier: "@tsedio/config-postgres",
        content: `withOptions(PostgresConfigSource, {
      name: "postgres",
      connectionString: "postgresql://postgres:postgres@localhost:5432/my_database", // PostgreSQL connection string
      table: "config" // Table used for config storage

      // Additional PostgresSQL client options can be provided here

      // ConfigSource options
      // validationSchema: object({}) // Optional: add a validation schema
    })`
      });
    }
  }
}
