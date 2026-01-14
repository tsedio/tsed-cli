import {defineTemplate} from "../utils/defineTemplate.js";
import {CliHttpClient} from "@tsed/cli-core";
import {inject} from "@tsed/di";

export default defineTemplate({
  id: "agents",
  label: "AGENTS.md",
  description: "Create AGENTS.md designed for AI project and Ts.ED",
  fileName: "AGENTS",
  ext: "md",
  outputDir: ".",
  hidden: true,
  preserveCase: true,

  async render() {
    const httpClient = inject(CliHttpClient);
    return httpClient.get<string>("https://tsed.dev/ai/AGENTS.md");
  }
});
