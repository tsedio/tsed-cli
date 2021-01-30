import {Inject, Injectable} from "@tsed/di";
import {snakeCase} from "change-case";
import {CliYaml} from "./CliYaml";

@Injectable()
export class CliDockerComposeYaml {
  @Inject()
  protected cliYaml: CliYaml;

  async read() {
    return this.cliYaml.read("docker-compose.yml");
  }

  async write(obj: any) {
    return this.cliYaml.write("docker-compose.yml", obj);
  }

  async addDatabaseService(name: string, database: string) {
    const dockerCompose: any = await this.read();

    if (dockerCompose) {
      switch (database) {
        case "mysql":
        case "mariadb":
          dockerCompose.services[snakeCase(name)] = {
            image: database === "mysql" ? "mysql:5.7.10" : "mariadb:10.1.16",
            ports: ["3306:3306"],
            environment: {
              MYSQL_ROOT_PASSWORD: "admin",
              MYSQL_USER: "test",
              MYSQL_PASSWORD: "test",
              MYSQL_DATABASE: "test"
            }
          };
          break;
        case "postgres":
          dockerCompose.services[snakeCase(name)] = {
            image: "postgres:9.6.1",
            ports: ["5432:5432"],
            environment: {
              POSTGRES_USER: "test",
              POSTGRES_PASSWORD: "test",
              POSTGRES_DB: "test"
            }
          };
          break;
        case "cockroachdb":
          dockerCompose.services[snakeCase(name)] = {
            image: "cockroachdb/cockroach:v2.1.4",
            command: "start --insecure",
            ports: ["26257:26257"]
          };
          break;
        case "mssql":
          dockerCompose.services[snakeCase(name)] = {
            image: "mcr.microsoft.com/mssql/server:2017-latest",
            command: "start --insecure",
            ports: ["1433:1433"],
            environment: {
              SA_PASSWORD: "Admin12345",
              ACCEPT_EULA: "Y"
            }
          };
          break;
        case "mongodb":
          dockerCompose.services[snakeCase(name)] = {
            image: "mongo:4.1",
            ports: ["27017:27017"]
          };
          break;
      }

      await this.write(dockerCompose);
    }
  }
}
