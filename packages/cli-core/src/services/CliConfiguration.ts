import {DIConfiguration, Injectable} from "@tsed/di";

@Injectable()
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
