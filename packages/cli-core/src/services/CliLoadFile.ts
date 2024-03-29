import {Inject, Injectable} from "@tsed/di";
import {extname} from "path";
import Ajv, {Schema} from "ajv";
import {CliYaml} from "./CliYaml";
import {CliFs} from "./CliFs";

@Injectable()
export class CliLoadFile {
  @Inject()
  protected cliYaml: CliYaml;

  @Inject()
  protected cliFs: CliFs;

  #ajv: Ajv;

  constructor() {
    const options = {
      verbose: false,
      coerceTypes: true,
      strict: false
    };

    this.#ajv = new Ajv(options);
  }

  /**
   * Load a configuration file from yaml, json
   */
  async loadFile<Model = any>(path: string, schema?: Schema): Promise<Model> {
    let config: any;
    const ext = extname(path);

    if ([".yml", ".yaml"].includes(ext)) {
      config = await this.cliYaml.read(path);
    } else if ([".json"].includes(ext)) {
      config = await JSON.parse(await this.cliFs.readFile(path, "utf8"));
    } else if (!config) {
      throw new Error("Unsupported format file");
    }

    if (schema) {
      const validate = this.#ajv.compile(schema);

      const isValid = validate(config);

      if (!isValid) {
        const [error] = validate.errors!;

        throw new Error(
          [
            `${error.instancePath.replace(/\//gi, ".")} `,
            error.message,
            error.params?.allowedValues && `. Allowed values: ${error.params?.allowedValues}`
          ]
            .filter(Boolean)
            .join("")
        );
      }
    }

    return config;
  }
}
