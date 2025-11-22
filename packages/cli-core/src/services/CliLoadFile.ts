import {extname} from "node:path";

import {inject, injectable} from "@tsed/di";
import type {JsonSchema} from "@tsed/schema";

import {validate} from "../utils/validate.js";
import {CliFs} from "./CliFs.js";
import {CliYaml} from "./CliYaml.js";

export class CliLoadFile {
  protected cliYaml: CliYaml = inject(CliYaml);
  protected cliFs = inject(CliFs);

  /**
   * Load a configuration file from yaml, json
   */
  async loadFile<Model = any>(path: string, schema?: JsonSchema<Model>): Promise<Model> {
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
      const {isValid, errors, value} = validate(config, schema);

      if (!isValid) {
        const [error] = errors!;

        throw new Error(
          [`${error.path.replace(/\//gi, ".")} `, error.message, error.expected && `. Allowed values: ${error.expected}`]
            .filter(Boolean)
            .join("")
        );
      }

      return value as Model;
    }

    return config;
  }
}

injectable(CliLoadFile);
