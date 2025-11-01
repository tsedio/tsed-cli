import type {RenderDataContext} from "./RenderDataContext.js";

export interface AlterRenderFiles {
  $alterRenderFiles(
    files: string[],
    data: RenderDataContext
  ): (string | {id: string; from: string})[] | Promise<(string | {id: string; from: string})[]>;
}
