import {join} from "node:path";

import {mapApiReferences} from "@tsed/vitepress-theme/composables/api/mappers/mapApiReferences.js";
import fsExtra from "fs-extra";

import api from "../../../public/api.json" with {type: "json"};

const IS_CORES = /cli-core|@tsed\/cli|cli-tasks|cli-prompts|cli-testing/;
const {writeFile} = fsExtra;

export async function buildReferenceSidebar(docsRoot) {
  const sidebarPath = join(docsRoot, "public/reference-sidebar.json");
  await writeFile(sidebarPath, JSON.stringify(getSidebar(), null, 2));
}

export function getSidebar() {
  const coreModules = ["cli-core"];
  const plugins = [];

  Object.entries(mapApiReferences(api).modules).forEach(([module, {symbols}]) => {
    const item = {
      text: module,
      collapsed: true,
      items: symbols.map((symbol) => {
        return {
          text: symbol.symbolName,
          link: symbol.path
        };
      })
    };

    if (IS_CORES.test(module)) {
      coreModules.push(item);
    } else {
      plugins.push(item);
    }
  });

  return [
    {
      text: "Core",
      items: coreModules.sort((a, b) => a.text.localeCompare(b.text))
    },
    {
      text: "Plugins",
      items: plugins.sort((a, b) => a.text.localeCompare(b.text))
    }
  ];
}
