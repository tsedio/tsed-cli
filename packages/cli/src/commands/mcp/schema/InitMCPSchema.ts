import {s} from "@tsed/schema";

import {InitSchema} from "../../init/config/InitSchema.js";

export const InitMCPSchema = () => {
  return s
    .object({
      cwd: s.string().required().description("Current working directory to initialize Ts.ED project")
    })
    .merge(InitSchema().omit("root", "skipPrompts", "file"));
};
