import {PackageManagersModule, ProjectPackageJson} from "@tsed/cli-core";
import {Inject, Module} from "@tsed/di";
import {NodeRuntime} from "./supports/NodeRuntime";
import {BabelRuntime} from "./supports/BabelRuntime";
import {WebpackRuntime} from "./supports/WebpackRuntime";
import {BunRuntime} from "./supports/BunRuntime";
import {SWCRuntime} from "./supports/SWCRuntime";
import {BaseRuntime} from "./supports/BaseRuntime";

export interface RuntimeInitOptions extends Record<string, unknown> {
  runtime?: string;
}

@Module({
  imports: [NodeRuntime, BabelRuntime, WebpackRuntime, SWCRuntime, BunRuntime]
})
export class RuntimesModule {
  @Inject()
  protected projectPackageJson: ProjectPackageJson;

  @Inject()
  protected packagesManager: PackageManagersModule;

  constructor(@Inject("runtime") protected runtimes: BaseRuntime[]) {
    this.runtimes = runtimes.filter((manager) => manager.has());
  }

  init(ctx: RuntimeInitOptions) {
    ctx.runtime = ctx.runtime || this.get().name;

    if (ctx.runtime === "bun") {
      ctx.packageManager = "bun";
    }
  }

  list(): string[] {
    return this.runtimes.sort((a, b) => a.order - b.order).map((manager) => manager.name);
  }

  get(name?: string) {
    if (this.projectPackageJson.preferences.runtime) {
      name = this.projectPackageJson.preferences.runtime;
    }

    name = name || "node";

    let selected = this.runtimes.find((runtime) => runtime.name === name);

    if (!selected) {
      selected = this.runtimes.find((manager) => manager.name === "node")!;
    }

    this.projectPackageJson.setPreference("runtime", selected.name);

    return selected;
  }

  scripts(ctx: RuntimeInitOptions) {
    const runtime = this.get(ctx.runtime);

    return {
      build: `${runtime.run("barrels")} && ${runtime.compile("src/index.ts", "dist/index.js")}`,
      barrels: "barrelsby --config .barrelsby.json",
      start: `${runtime.run("barrels")} && ${runtime.startDev("src/index.ts")}`,
      "start:prod": `cross-env NODE_ENV=production ${runtime.startProd("dist/index.js")}`
    };
  }
}
