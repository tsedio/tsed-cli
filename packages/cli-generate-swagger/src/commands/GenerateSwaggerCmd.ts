import {CliFs, CliYaml, Command, type CommandProvider, Constant, Inject, InjectorService, Type} from "@tsed/cli-core";
import path, {join, resolve} from "path";

export interface GenerateSwaggerCtx {
  output: string;
}

@Command({
  name: "generate-swagger",
  description: "Generate the client API from swagger spec",
  options: {
    "-o, --output <output>": {
      required: true,
      type: String,
      description: "Path to generate files"
    }
  }
})
export class GenerateSwaggerCmd implements CommandProvider {
  @Inject()
  injector: InjectorService;

  @Inject()
  protected fs: CliFs;

  @Inject()
  protected cliYaml: CliYaml;

  @Constant("server")
  protected serverModule: Type<any>;

  $mapContext($ctx: GenerateSwaggerCtx) {
    return {...$ctx, output: resolve(join(process.cwd(), $ctx.output))};
  }

  $exec($ctx: GenerateSwaggerCtx) {
    return [
      {
        title: "generate client",
        task: () => this.generate($ctx)
      }
    ];
  }

  private async loadPlatformModule(): Promise<{
    bootstrap(module: any, settings: any): Promise<{injector: InjectorService; stop(): Promise<void>}>;
  }> {
    try {
      // @ts-ignore
      let platform = await import("@tsed/platform-express");

      if (platform) {
        return platform.PlatformExpress;
      }
    } catch (er) {}

    try {
      // @ts-ignore
      const platform = await import("@tsed/platform-koa");

      if (platform) {
        return platform.PlatformKoa;
      }
    } catch (er) {}

    throw new Error("Unsupported platform. Please use Express.js or Koa.js platform.");
  }

  private async generate($ctx: GenerateSwaggerCtx) {
    const Platform = await this.loadPlatformModule();
    // @ts-ignore
    const {SwaggerService} = await import("@tsed/swagger");

    const platform = await Platform.bootstrap(this.serverModule, {
      logger: {level: "off"}
    });

    const swaggerService = platform.injector.get<any>(SwaggerService)!;
    const confs = platform.injector.settings.get<any[]>("swagger", []);

    await this.fs.raw.remove($ctx.output);
    await this.fs.ensureDir($ctx.output);

    const promises = confs.map(async (conf) => {
      const spec = await swaggerService.getOpenAPISpec(conf);

      await this.generateFromSpec(spec, conf, $ctx);
    });

    await Promise.all(promises);

    await platform.stop();
  }

  private async generateFromSpec(spec: any, conf: any, $ctx: GenerateSwaggerCtx) {
    const fileJson = path.resolve(path.join($ctx.output, conf.path, "swagger.json"));
    const fileYaml = path.resolve(path.join($ctx.output, conf.path, "swagger.yaml"));

    this.fs.ensureDirSync(path.dirname(fileJson));

    await Promise.all([this.fs.writeJson(fileJson, spec), this.cliYaml.write(fileYaml, spec)]);
  }
}
