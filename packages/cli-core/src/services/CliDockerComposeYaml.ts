import {join} from "node:path";

import {setValue} from "@tsed/core";
import {inject, injectable} from "@tsed/di";
import {snakeCase} from "change-case";

import {CliFs} from "./CliFs.js";
import {CliYaml} from "./CliYaml.js";
import {ProjectPackageJson} from "./ProjectPackageJson.js";

export class CliDockerComposeYaml {
  protected cliYaml = inject(CliYaml);
  protected fs = inject(CliFs);
  protected projectPackageJson = inject(ProjectPackageJson);

  read() {
    const path = "docker-compose.yml";
    const file = !this.fs.exists(path) ? this.fs.findUpFile(this.projectPackageJson.dir, path) : path;

    if (file) {
      return this.cliYaml.read("docker-compose.yml");
    }

    return Promise.resolve({});
  }

  write(obj: any) {
    const path = "docker-compose.yml";
    const file = this.fs.findUpFile(this.projectPackageJson.dir, path) || join(this.projectPackageJson.dir, path);

    return this.cliYaml.write(file, obj);
  }

  async addDatabaseService(name: string, database: string) {
    const dockerCompose: any = await this.read();
    if (dockerCompose) {
      let value: any;
      switch (database) {
        case "mysql":
        case "mariadb":
          value = {
            image: database === "mysql" ? "mysql:8.0.28-oracle" : "mariadb:10.7.3",
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
          value = {
            image: "postgres:9.6.1",
            ports: ["5432:5432"],
            volumes: ["./pgdata:/var/lib/postgresql/data"],
            environment: {
              POSTGRES_USER: "test",
              POSTGRES_PASSWORD: "test",
              POSTGRES_DB: "test"
            }
          };
          break;
        case "cockroachdb":
          value = {
            image: "cockroachdb/cockroach:v2.1.4",
            command: "start --insecure",
            ports: ["26257:26257"]
          };
          break;
        case "mssql":
          value = {
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
          value = {
            image: "mongo:5.0.8",
            ports: ["27017:27017"]
          };
          break;
      }

      setValue(dockerCompose, `services.${snakeCase(name)}`, value);
      await this.write(dockerCompose);
    }
  }
}

injectable(CliDockerComposeYaml);
