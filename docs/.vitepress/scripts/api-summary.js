import {writeFile} from "node:fs/promises";

import {mapApiReferences} from "@tsed/vitepress-theme/composables/api/mappers/mapApiReferences.js";

import api from "../../public/api.json" with {type: "json"};
const IS_CORES = /cli-core|@tsed\/cli|cli-tasks|cli-prompts|cli-testing/;

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

await writeFile(import.meta.dirname + "/../../public/reference-sidebar.json", JSON.stringify(getSidebar(), null, 2));
