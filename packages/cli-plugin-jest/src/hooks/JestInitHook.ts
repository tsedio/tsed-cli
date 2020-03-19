import {IInitCmdContext} from "@tsed/cli";
import {Inject, Injectable, OnExec, ProjectPackageJson, Renderer} from "@tsed/cli-core";

@Injectable()
export class JestInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @OnExec("init")
  onInitExec(options: IInitCmdContext) {}

  addScripts(options: IInitCmdContext) {
    this.packageJson.addScripts({});
  }

  addDependencies(options: IInitCmdContext) {
    this.packageJson.addDependencies({}, options);
  }

  addDevDependencies(options: IInitCmdContext) {
    this.packageJson.addDevDependencies({}, options);
  }
}
