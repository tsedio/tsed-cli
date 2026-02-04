import {defineTemplate} from "../utils/defineTemplate.js";
import type {RenderDataContext} from "../interfaces/RenderDataContext.js";

export default defineTemplate({
  id: "docker-compose.yml",
  label: "Docker Compose",
  description: "Create a docker-compose.yml file.",
  fileName: "docker-compose",
  outputDir: ".",
  ext: "yml",
  preserveCase: true,
  render(_, context: RenderDataContext) {
    return `services:
  server:
    build:
      context: .
      dockerfile: ./Dockerfile
      args:
        - http_proxy
        - https_proxy
        - no_proxy
    image: ${context.projectName}/server:latest
    ports:
      - "8081:8081"
`;
  }
});
