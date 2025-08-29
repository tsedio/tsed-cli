import type {RenderDataContext} from "./RenderDataContext.js";

export interface AlterRenderFiles {
  $alterRenderFiles(files: string[], data: RenderDataContext): string[] | Promise<string[]>;
}
