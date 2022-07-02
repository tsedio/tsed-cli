import {filedirname, getTemplateDirectory} from "@tsed/cli-core";

const [, dir] = filedirname();

export const TEMPLATE_DIR = getTemplateDirectory(dir);
