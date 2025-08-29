import type {RenderDataContext} from "../../interfaces/RenderDataContext.js";
import type {ProjectClient} from "../../services/ProjectClient.js";

export interface InitBasePlatform {
  readonly name: string;

  alterProjectFiles(project: ProjectClient, ctx: RenderDataContext): void;

  dependencies(ctx: any): Record<string, string>;

  devDependencies(ctx: any): Record<string, string>;
}
