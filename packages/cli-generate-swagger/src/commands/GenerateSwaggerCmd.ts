import {CliFs, Command, CommandProvider, Constant, Inject, InjectorService, Type} from "@tsed/cli-core";
import {importPackage} from "@tsed/core";
import path, {join, resolve} from "path";
import {Hooks, RawRouteInfo, RouteNameInfo} from "swagger-typescript-api";

export interface GenerateSwaggerCtx {
  output: string;
}

export interface GenerateSwaggerOpts {
  hooks?: Partial<Hooks>;

  transformOperationId?(operationId: string, routeNameInfo: RouteNameInfo, raw: RawRouteInfo): string;
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

  @Constant("server")
  protected serverModule: Type<any>;

  @Constant("Swagger", {hooks: {}})
  protected options: Partial<GenerateSwaggerOpts>;

  $mapContext($ctx: GenerateSwaggerCtx) {
    return {...$ctx, output: resolve(join(process.cwd(), $ctx.output))};
  }

  async $exec($ctx: GenerateSwaggerCtx) {
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
    let platform = await importPackage("@tsed/platform-express", undefined, true);

    if (platform) {
      return platform.PlatformExpress;
    }

    platform = await importPackage("@tsed/platform-koa", undefined, true);

    if (platform) {
      return platform.PlatformKoa;
    }

    throw new Error("Unsupported platform. Please use Express.js or Koa.js platform.");
  }

  private async generate($ctx: GenerateSwaggerCtx) {
    const Platform = await this.loadPlatformModule();
    const {SwaggerService} = await importPackage("@tsed/swagger");

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
    const file = path.resolve(path.join($ctx.output, conf.path, "swagger.json"));

    this.fs.ensureDirSync(path.dirname(file));

    return this.fs.writeFile(file, JSON.stringify(spec, null, 2), {encoding: "utf8"});
  }
}
