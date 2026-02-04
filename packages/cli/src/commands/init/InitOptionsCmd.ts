import {command} from "@tsed/cli-core";
import {s} from "@tsed/schema";

import {InitSchema} from "./config/InitSchema.js";

export const InitOptionsCommand = command({
  name: "init-options",
  description: "Display available options for Ts.ED init command for external tool",
  disableReadUpPkg: true,
  inputSchema: s.object({
    indent: s.number().default(0).description("Json indentation value").opt("-i, --indent <indent>")
  }),
  handler(data) {
    console.log(
      JSON.stringify(
        InitSchema().toJSON({
          useAlias: false,
          customKeys: true
        }),
        null,
        data.indent
      )
    );
  }
}).token();
