import {constantCase, kebabCase} from "change-case";
import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "mongoose.connection",
  label: "Mongoose Connection",
  fileName: "{{symbolName}}.connection",
  outputDir: "{{srcDir}}/config/mongoose",

  render(symbolName: string, data: GenerateCmdContext) {
    return `export default {
  id: "${symbolName}",
  url: process.env.${constantCase(symbolName)}_URL || "mongodb://localhost:27017/${kebabCase(data.name)}",
  connectionOptions: { }
}`;
  }
});
