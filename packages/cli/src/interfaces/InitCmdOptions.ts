import type {RenderDataContext} from "./RenderDataContext.js";

export interface InitOptions extends RenderDataContext {
  root: string;
  srcDir: string;
  skipPrompt?: boolean;
  GH_TOKEN?: string;
}

export type InitCmdContext = InitOptions;
