import {PackageManagersModule, ProjectPackageJson} from "@tsed/cli-core";
import {Inject, inject, injectable, injectMany} from "@tsed/di";

import {BabelRuntime} from "./supports/BabelRuntime.js";
import {BaseRuntime} from "./supports/BaseRuntime.js";
import {BunRuntime} from "./supports/BunRuntime.js";
import {NodeRuntime} from "./supports/NodeRuntime.js";
import {WebpackRuntime} from "./supports/WebpackRuntime.js";

export interface RuntimeInitOptions extends Record<string, unknown> {
  runtime?: string;
}

export class RuntimesModule {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected packagesManager = inject(PackageManagersModule);
  private runtimes: BaseRuntime[];

  constructor() {
    this.runtimes = injectMany<BaseRuntime>("runtime").filter((manager) => manager.has());
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
      barrels: "barrels",
      start: `${runtime.run("barrels")} && ${runtime.startDev("src/index.ts")}`,
      "start:prod": `cross-env NODE_ENV=production ${runtime.startProd("dist/index.js")}`
    };
  }
}

injectable(RuntimesModule).imports([NodeRuntime, BabelRuntime, WebpackRuntime, BunRuntime]);
