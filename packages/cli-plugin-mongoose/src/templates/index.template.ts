import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "mongoose.index",
  label: "Mongoose Index",
  fileName: "index",
  outputDir: "{{srcDir}}/config/mongoose",
  hidden: true,

  render() {
    return `//keep this default 
export default [];`;
  }
});
