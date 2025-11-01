import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {getDatabase, getTypeORMDatabases} from "../utils/getTypeORMDatabases.js";
import {camelCase} from "change-case";
import type {CliDatabases} from "@tsed/cli-core";

declare global {
  namespace TsED {
    interface GenerateOptions {
      typeormDataSource?: string;
      datasourceName?: string;
    }
  }
}

function datasourceConfig(database?: CliDatabases) {
  switch (database) {
    case "mysql":
    case "mariadb":
      return `
  host: "localhost",
  port: 3306,
  username: "test",
  password: "test",
  database: "test"`;
    case "sqlite":
    case "better-sqlite3":
      return `
    database: "database.sqlite"`;
    case "postgres":
      return `
    host: "localhost",
    port: 5432,
    username: "test",
    password: "test",
    database: "test"`;
    case "cockroachdb":
      return `
    host: "localhost",
    port: 26257,
    username: "root",
    password: "",
    database: "defaultdb"`;
    case "mssql":
      return `
    host: "localhost",
    username: "sa",
    password: "Admin12345",
    database: "tempdb"`;
    case "oracle":
      return `
    host: "localhost",
    username: "system",
    password: "oracle",
    port: 1521,
    sid: "xe.oracle.docker"`;
    case "mongodb":
      return `
    database: "test"`;
  }
}

export default defineTemplate({
  id: "typeorm:datasource",
  label: "TypeORM DataSource",
  fileName: "{{symbolName}}.datasource",
  outputDir: "{{srcDir}}/datasources",
  prompts: () => {
    const list = getTypeORMDatabases().map(([value, {name}]) => {
      return {
        name: name,
        value: value
      };
    });

    return [
      {
        type: "autocomplete" as any,
        name: "typeormDataSource",
        message: "Which database type?",
        when(state: any) {
          return state.type === "typeorm:datasource";
        },
        source: (state: any, keyword: string) => {
          if (keyword) {
            return list.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
          }

          return list;
        }
      }
    ];
  },

  render(symbolName: string, data: GenerateCmdContext) {
    const database = getDatabase(data);
    const instanceName = camelCase(symbolName);

    return `import {injectable, logger} from "@tsed/di";
import {DataSource} from "typeorm";
import {Logger} from "@tsed/logger";

export const ${instanceName} = new DataSource({
  type: "${database}",
  entities: [],
  ${datasourceConfig(database)?.trim()}
});

export const ${symbolName} = injectable(Symbol.for("${symbolName}"))
  .type("typeorm:datasource")
  .asyncFactory(async () => {
     await ${instanceName}.initialize();
     
     logger().info("Connected with typeorm to database: ${data.name}");

     return ${instanceName};
  })
  .hooks({
    $onDestroy(dataSource) {
      return dataSource.isInitialized && dataSource.close();
    }
  })
  .token();
  
export type ${symbolName} = DataSource;
`;
  }
});
