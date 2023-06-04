import {getTemplateDirectory} from "@tsed/cli-core";
import path from "node:path";
import {fileURLToPath} from "node:url";

export const TEMPLATE_DIR = getTemplateDirectory(path.dirname(fileURLToPath(import.meta.url)));
