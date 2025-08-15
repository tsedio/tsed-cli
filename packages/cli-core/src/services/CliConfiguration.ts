import {DIConfiguration, injectable} from "@tsed/di";

export class CliConfiguration extends DIConfiguration {
  constructor() {
    super({
      project: {
        root: process.cwd(),
        srcDir: "src"
      }
    });
  }
}

injectable(CliConfiguration);
