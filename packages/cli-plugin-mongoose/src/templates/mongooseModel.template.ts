import {defineTemplate} from "@tsed/cli";
import {camelCase} from "change-case";
// @ts-ignore
import {plural} from "pluralize";

export default defineTemplate({
  id: "mongoose.model",
  label: "Mongoose model",
  fileName: "{{symbolName}}.model",
  outputDir: "{{srcDir}}/models",

  render(symbolName: string) {
    const collectionName = plural(camelCase(symbolName.replace(/Schema|Model/gi, "")));

    return `import { Model, ObjectID } from "@tsed/mongoose";
@Model({
  name: "${collectionName}"
})
export class ${symbolName} {
  @ObjectID("id")
  _id: string;
}`;
  }
});
