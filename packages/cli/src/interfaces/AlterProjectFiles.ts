import type {ProjectClient} from "../services/ProjectClient.js";
import type {RenderDataContext} from "./RenderDataContext.js";

export interface AlterProjectFiles {
  $alterProjectFiles(project: ProjectClient, data: RenderDataContext): ProjectClient | Promise<ProjectClient>;
}
