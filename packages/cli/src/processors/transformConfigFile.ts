import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import type {ProjectClient} from "../services/ProjectClient.js";

export function transformConfigFile(project: ProjectClient, data: RenderDataContext) {
  if (!data.config && data.commandName === "init") {
    project.addConfigSource("EnvsConfigSource");
  }

  if (data.config) {
    console.log(data.config);
  }
}
