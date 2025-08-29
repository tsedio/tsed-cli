import type {RenderDataContext} from "./RenderDataContext.js";

declare global {
  namespace TsED {
    interface GenerateOptions {}
  }
}

export interface GenerateCmdContext extends RenderDataContext, TsED.GenerateOptions {
  type: string;
  name: string;
  route: string;
  directory: string;
  templateType: string;
  middlewarePosition: "before" | "after";
  symbolName: string;
  symbolPath: string;
  symbolPathBasename: string;
  getName: (state: Partial<GenerateCmdContext>) => string;
}
