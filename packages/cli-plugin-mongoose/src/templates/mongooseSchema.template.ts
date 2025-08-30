import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "mongoose.schema",
  label: "Mongoose schema",
  fileName: "{{symbolName}}.schema",
  outputDir: "{{srcDir}}/schemas",

  render(symbolName: string) {
    return `import { Property } from "@tsed/schema";
import { Schema } from "@tsed/mongoose";

@Schema()
export class ${symbolName} {
  @Property()
  unique: string;
}`;
  }
});
