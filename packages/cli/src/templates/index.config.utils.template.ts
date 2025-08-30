import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "index.config.util",
  label: "Is Production utility",
  type: "util",
  description: "Create a utility to check if the environment is production",
  fileName: "index",
  outputDir: "{{srcDir}}/config/utils",
  preserveCase: true,
  hidden: true,

  render(_, data) {
    return `process.env.NODE_ENV = process.env.NODE_ENV || "development";

export const isProduction = process.env.NODE_ENV === "production";
`;
  }
});
