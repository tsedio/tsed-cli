import path from "node:path";
import {fileURLToPath} from "node:url";

import {getTemplateDirectory} from "@tsed/cli-core";

export const TEMPLATE_DIR = getTemplateDirectory(path.dirname(fileURLToPath(import.meta.url)));
