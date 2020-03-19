import {IInitCmdContext} from "@tsed/cli";
import {Inject, Injectable, OnExec, ProjectPackageJson, Renderer} from "@tsed/cli-core";

@Injectable()
export class JestInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @OnExec("init")
  onInitExec(ctx: IInitCmdContext) {}

  addScripts(ctx: IInitCmdContext) {
    this.packageJson.addScripts({});
  }

  addDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
